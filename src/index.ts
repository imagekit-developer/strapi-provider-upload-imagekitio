//@ts-nocheck
/* global strapi */
const ImageKit = require("imagekit");
import { ProviderOptions } from "./interfaces/ProviderOptions";
import { toUploadParams } from "./utils";

export default {
  init(providerOptions: ProviderOptions) {
    const imagekit = new ImageKit({
      publicKey: providerOptions.publicKey,
      privateKey: providerOptions.privateKey,
      urlEndpoint: providerOptions.urlEndpoint,
    });
    const uploadOptions = providerOptions.uploadOptions || {};

    const upload = (file): Promise<void> => {
      strapi.log.info(JSON.stringify(uploadOptions));
      return new Promise((resolve, reject) => {
        const uploadParams = toUploadParams(uploadOptions);
        imagekit
          .upload({ ...uploadParams, file: file.buffer, fileName: `${file.hash}${file.ext}` })
          .then((response) => {
            const { fileId, url } = response;
            file.url = url;
            file.provider_metadata = {
              fileId: fileId,
            };
            strapi.log.info(`File uploaded successfully with id ${fileId}`);
            file.provider_metadata = {
              fileId: fileId,
              ...uploadOptions,
            };
            return resolve();
          })
          .catch((err) => {
            strapi.log.error(`File upload failed`);
            return reject(err);
          });
      });
    };

    const uploadStream = async (file) => {
      if (!file?.stream) {
        const error = new Error("Missing file stream");
        strapi.log.error(error.message);
        return Promise.reject(error);
      }

      const streamToBuffer = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", (err) => reject(err));
        });

      try {
        strapi.log.info(`Processing file stream for upload.`);
        file.buffer = await streamToBuffer(file.stream);
        strapi.log.info(`File stream successfully converted to buffer. Uploading file...`);
        return await upload(file);
      } catch (error) {
        strapi.log.error(`Error during file upload: ${error.message}`);
        return Promise.reject(error);
      }
    };

    const deleteFile = (file) => {
      return new Promise<void>((resolve, reject) => {
        const fileId = file?.provider_metadata?.fileId;
        if (fileId) {
          imagekit
            .deleteFile(fileId)
            .then((response) => {
              strapi.log.info(`File with ID ${fileId} deleted successfully.`);
              return resolve();
            })
            .catch((error) => {
              strapi.log.error(`Error deleting file with ID ${fileId}. Error: ${error.message}`);
              return resolve();
              // return reject(error);
            });
        } //else return reject("No fileId found");
        else return resolve();
      });
    };

    return {
      upload: upload,
      uploadStream: uploadStream,
      delete: deleteFile,
      async getSignedUrl(file) {
        try {
          const isPrivateFile = file?.provider_metadata?.isPrivateFile;
          const folder = file?.provider_metadata?.folder;
          if (isPrivateFile) {
            strapi.log.info(`Generating signed URL for private file with ID ${file.provider_metadata.fileId}`);
            const imageURL = await imagekit.url({
              src: file.url,
              signed: true,
            });
            return { url: imageURL || file.url };
          } else return { url: file.url };
        } catch (err) {
          return { url: file.url };
        }
      },
      isPrivate() {
        return uploadOptions.isPrivateFile ?? false;
      },
    };
  },
};
