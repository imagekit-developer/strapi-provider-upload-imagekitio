import { StrapiUploadOptions } from "./interfaces/ProviderOptions";

export const toUploadParams = (uploadOptions: StrapiUploadOptions) => {
  const validParams: StrapiUploadOptions = {};

  for (const key in uploadOptions) {
    if (uploadOptions[key] !== undefined && uploadOptions[key] !== null) {
      validParams[key] = uploadOptions[key];
    }
  }

  return validParams;
};
