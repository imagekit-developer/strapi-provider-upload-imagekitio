import { UploadOptions } from "imagekit/dist/libs/interfaces";

export type StrapiUploadOptions = Omit<UploadOptions, "file" | "fileName" | "responseFields" | "overwriteFile" | "isPublished">;

export interface ProviderOptions {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  uploadOptions?: StrapiUploadOptions;
}
