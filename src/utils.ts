import { join } from "path";
import { Result, StrapiUploadOptions, File } from "./interfaces";

const ValidUploadParams = [
  "tags", 
  "customCoordinates", 
  "extensions", 
  "webhookUrl", 
  "overwriteAITags", 
  "overwriteTags", 
  "overwriteCustomMetadata", 
  "customMetadata", 
  "transformation", 
  "checks",
];

export const toUploadParams = (file: File, uploadOptions: StrapiUploadOptions = {}): StrapiUploadOptions => {
  const params = Object.entries(uploadOptions).reduce((acc, [key, value]) => {
    if (ValidUploadParams.includes(key) && value !== undefined && value !== null) {
      acc[key as keyof StrapiUploadOptions] = value;
    }
    return acc;
  }, {} as Record<keyof StrapiUploadOptions, any>);

  const ignoreStrapiFolders = uploadOptions.ignoreStrapiFolders ?? false;

  if (uploadOptions.folder && !ignoreStrapiFolders && file.folderPath) {
    params.folder = join(uploadOptions.folder, file.folderPath);
  } else if (uploadOptions.folder) {
    params.folder = uploadOptions.folder;
  } else if (file.folderPath) {
    params.folder = file.folderPath;
  }

  return params;
};

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
