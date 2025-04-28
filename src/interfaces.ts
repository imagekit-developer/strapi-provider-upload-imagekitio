import type { ReadStream } from "node:fs";
import { UploadOptions } from "imagekit/dist/libs/interfaces";
import StrapiUploadServer from "@strapi/upload/strapi-server";

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export type StrapiUploadOptions = Omit<
  UploadOptions,
  "file" | "fileName" | "responseFields" | "overwriteFile" | "isPublished" | "isPrivate" | "useUniqueFileName"
> & {
  ignoreStrapiFolders?: boolean;
};

export interface InitOptions {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  restrictUnsignedUrls?: boolean;
}

export type File = Parameters<ReturnType<ReturnType<typeof StrapiUploadServer>["services"]["provider"]>["upload"]>[0];
