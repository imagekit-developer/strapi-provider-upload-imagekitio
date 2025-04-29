import ImageKit from "imagekit";
import type { ReadStream } from "node:fs";
import { toUploadParams, tryCatch } from "./utils";
import { InitOptions, File, StrapiUploadOptions } from "./interfaces";
import { UrlOptionsSrc } from "imagekit/dist/libs/interfaces/UrlOptions";

class ImageKitProvider {
  #client: ImageKit;
  #useSignedUrls: boolean;

  /* Strapi Upload Plugin Interface */
  delete = this.#deleteFile;
  upload = this.#upload;
  uploadStream = this.#upload;
  getSignedUrl = this.#getSignedUrl;
  isPrivate = this.#isPrivate;

  constructor({ publicKey, privateKey, urlEndpoint, useSignedUrls }: InitOptions) {
    this.#client = this.#getImageKitClient({ publicKey, privateKey, urlEndpoint });
    this.#useSignedUrls = useSignedUrls || false;
  }

  static init({ publicKey, privateKey, urlEndpoint, useSignedUrls }: InitOptions) {
    return new ImageKitProvider({ publicKey, privateKey, urlEndpoint, useSignedUrls });
  }

  #getSignedUrl(file: File, customParams: Omit<UrlOptionsSrc, "src" | "signed"> = {}) {
    try {
      strapi.log.debug(
        `[ImageKit Upload Provider] Generating signed URL for file with ID ${file.provider_metadata?.fileId}`,
      );
      const imageURL = this.#client.url({
        src: file.url!,
        signed: this.#isPrivate(),
        ...customParams,
      });
      return { url: imageURL };
    } catch (err) {
      strapi.log.error(
        `[ImageKit Upload Provider] Error generating signed URL for file with ID ${file.provider_metadata?.fileId}`,
      );
      return { url: file.url };
    }
  }

  #isPrivate() {
    return this.#useSignedUrls;
  }

  #getImageKitClient(config: InitOptions) {
    const missingConfigs = [];
    if (!config.publicKey) {
      missingConfigs.push("publicKey");
    }

    if (!config.privateKey) {
      missingConfigs.push("privateKey");
    }

    if (!config.urlEndpoint) {
      missingConfigs.push("urlEndpoint");
    }

    if (missingConfigs.length > 0) {
      const error = [
        `Please remember to set up the file based config for the provider.`,
        `Refer to the "Configuration" of the README for this plugin for additional details.`,
        `Configs missing: ${missingConfigs.join(", ")}`,
      ].join(" ");

      throw new Error(`Error regarding @imagekit/strapi-provider-upload config: ${error}`);
    }

    return new ImageKit({
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      urlEndpoint: config.urlEndpoint,
    });
  }

  async #upload(file: File, customParams: StrapiUploadOptions = {}): Promise<void> {
    let fileToUpload: Buffer | ReadStream | undefined;
    if (file?.buffer) {
      fileToUpload = file.buffer;
    } else if (file?.stream) {
      fileToUpload = file.stream as ReadStream;
    } else {
      return Promise.reject(new Error("[ImageKit Upload Provider] Missing file buffer or stream"));
    }

    strapi.log.debug(`[ImageKit Upload Provider] File to upload: ${JSON.stringify(file)} using ${typeof fileToUpload}`);

    await this.#uploadFile(file, fileToUpload, customParams);

    return Promise.resolve();
  }

  async #uploadFile(
    file: File,
    fileToUpload: Buffer | ReadStream,
    customParams: StrapiUploadOptions = {},
  ): Promise<void> {
    const response = await tryCatch(
      this.#client?.upload({
        ...toUploadParams(file, customParams),
        file: fileToUpload,
        fileName: `${file.hash}${file.ext}`,
        useUniqueFileName: false,
        isPrivateFile: this.#isPrivate(),
      }),
    );

    if (response.error) {
      strapi.log.error(`[ImageKit Upload Provider]Error uploading file: ${response.error}`);
      return Promise.reject(response.error);
    }

    const { fileId, url } = response.data;

    strapi.log.info(`[ImageKit Upload Provider] File uploaded successfully with id ${fileId}`);

    file.url = url;

    file.provider_metadata = {
      fileId: fileId,
    };
  }

  async #deleteFile(file: File) {
    const fileId = file?.provider_metadata?.fileId as string;

    strapi.log.debug(`[ImageKit Upload Provider] Deleting file with id ${fileId}`);

    if (fileId) {
      const getFileResponse = await tryCatch(this.#client.getFileDetails(fileId));

      if (getFileResponse.error) {
        strapi.log.error(
          `[ImageKit Upload Provider] File with ID ${fileId} does not exist. Might have been deleted from ImageKit dashboard already.`,
        );
        return Promise.resolve();
      }

      const deleteFileResponse = await tryCatch(this.#client.deleteFile(fileId));

      if (deleteFileResponse.error) {
        strapi.log.error(`[ImageKit Upload Provider] Error deleting file: ${deleteFileResponse.error}`);
        return Promise.reject(deleteFileResponse.error);
      }

      strapi.log.info(`[ImageKit Upload Provider] File with ID ${fileId} deleted successfully.`);
      return Promise.resolve();
    }

    return Promise.resolve();
  }
}

export default ImageKitProvider;
