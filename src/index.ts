import ImageKit from "imagekit";
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
            console.log(`File uploaded successfully with id ${fileId}`);
            file.provider_metadata = {
              fileId: fileId,
              ...uploadOptions,
            };
            return resolve();
          })
          .catch((err) => {
            console.log(`File upload failed`);
            return reject(err);
          });
      });
    };

    const uploadStream = async (file) => {
      if (!file?.stream) {
        const error = new Error("Missing file stream");
        console.log(error.message);
        return Promise.reject(error);
      }

      const streamToBuffer = (stream) =>
        new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", (err) => reject(err));
        });

      try {
        console.log(`Processing file stream for upload.`);
        file.buffer = await streamToBuffer(file.stream);
        console.log(`File stream successfully converted to buffer. Uploading file...`);
        return await upload(file);
      } catch (error) {
        console.log(`Error during file upload: ${error.message}`);
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
              console.log(`File with ID ${fileId} deleted successfully.`);
              return resolve();
            })
            .catch((error) => {
              console.log(`Error deleting file with ID ${fileId}. Error: ${error.message}`);
              return reject(error);
            });
        } else return reject("No fileId found");
      });
    };

    return {
      upload: upload,
      uploadStream: uploadStream,
      delete: deleteFile,
      async getSignedUrl(file) {
        try {
          console.log(`Generating signed URL for file with ID ${file.provider_metadata.fileId}`);
          const imageURL = await imagekit.url({
            src: file.url,
            signed: true,
          });
          return { url: imageURL };
        } catch (err) {
          console.log(`Error generating signed URL for file with ID ${file.provider_metadata.fileId}`);
          return { url: file.url };
        }
      },
      isPrivate() {
        return true;
      },
    };
  },
};
