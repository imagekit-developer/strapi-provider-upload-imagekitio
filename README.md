[<img width="250" alt="ImageKit.io" src="https://raw.githubusercontent.com/imagekit-developer/imagekit-javascript/master/assets/imagekit-light-logo.svg"/>](https://imagekit.io)

# Strapi Upload Provider for ImageKit.io

<!-- [![Node CI](https://github.com/imagekit-developer/imagekit-next/workflows/Node%20CI/badge.svg)](https://github.com/imagekit-developer/strapi-provider-upload-imagekitio/) -->
[![npm version](https://img.shields.io/npm/v/@imagekit/strapi-provider-upload)](https://www.npmjs.com/package/@imagekit/strapi-provider-upload)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/imagekitio?label=Follow&style=social)](https://twitter.com/ImagekitIo)

A Strapi provider for [ImageKit.io](https://imagekit.io/) that allows you to upload and manage assets directly in the ImageKit media library from Strapi.

ImageKit is a complete media storage, optimization, and transformation solution with an image and video CDN. It integrates with your existing infrastructure (AWS S3, web servers, CDN, custom domains) to deliver optimized images in minutes with minimal code changes.

## Installation

Add the provider to your project by executing any of the below commands.

```bash
# using yarn
yarn add @imagekit/strapi-provider-upload

# using npm
npm install @imagekit/strapi-provider-upload --save
```

## Configuration

To enable this provider, add or update the configuration in your `./config/plugins.js` (or `./config/plugins.ts` for TypeScript projects):

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "@imagekit/strapi-provider-upload",
      providerOptions: {
        publicKey: env("IMAGEKIT_PUBLIC_KEY"),
        privateKey: env("IMAGEKIT_PRIVATE_KEY"),
        urlEndpoint: env("IMAGEKIT_URL_ENDPOINT"),

        /**
         * Determines whether all asset URLs should be delivered as signed (authenticated) URLs.
         * Enable this if you are serving private files or if the "Restrict unsigned image URLs" option is enabled in your ImageKit dashboard.
         * @default false
         */
        useSignedUrls: false,
      },
      actionOptions: {
        upload: {
          /**
           * If true, all assets are uploaded into the base folder, ignoring Strapi's folder structure.
           * Useful because Strapi may set folder names as numbers instead of user-defined names.
           * @default false
           */
          ignoreStrapiFolders: false,

          /**
           * Folder path (relative to the root) where the file will be uploaded.
           * @default "/"
           */
          folder: "/",
          // Other ImageKit upload options can be set here (see below)
        },
        uploadStream: {
          ignoreStrapiFolders: false,
          folder: "/",
          // Other ImageKit upload options can be set here (see below)
        },
      },
    },
  },
});
```

See the [documentation about using a provider](https://docs.strapi.io/cms/providers#configuring-providers) for information on installing and using a provider. To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Options (providerOptions)

You can obtain your ImageKit API keys and URL endpoint from your [ImageKit dashboard](https://imagekit.io/dashboard/developer/api-keys).

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| publicKey | string | Yes | Your ImageKit public API key |
| privateKey | string | Yes | Your ImageKit private API key |
| urlEndpoint | string | Yes | Your ImageKit URL endpoint |
| useSignedUrls | boolean | No | Determines whether all asset URLs should be delivered as signed (authenticated) URLs.<br> Enable this if you are serving private files or if the "Restrict unsigned image URLs" option is enabled in your ImageKit dashboard. <br> Default: false |

### Action Options (actionOptions.upload and actionOptions.uploadStream)

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| ignoreStrapiFolders | boolean | No | If true, uploads all assets to the base folder, ignoring Strapi's folder structure. Default: false |
| folder | string | No | Folder path (relative to root) for uploads. Default: "/" |

#### Supported ImageKit Upload Parameters

The provider supports the following ImageKit upload parameters, which can be included in your configuration:

- `tags`: Array of tags to add to the uploaded file
- `customCoordinates`: Define an important area in the image to be used with fo-custom transformation
- `extensions`: Array of extensions to be applied to the uploaded image
- `webhookUrl`: URL where upload webhook notifications for extensions will be sent
- `overwriteAITags`: Boolean to control whether to overwrite AI-generated tags
- `overwriteTags`: Boolean to control whether to overwrite existing tags
- `overwriteCustomMetadata`: Boolean to control whether to overwrite existing custom metadata
- `customMetadata`: Object containing custom metadata fields
- `transformation`: Object containing properties for pre and post transformations
- `checks`: String containing server-side checks to run on the asset

For detailed information about these parameters, refer to the [ImageKit Upload API documentation](https://imagekit.io/docs/api-reference/upload-file/upload-file#request-body).


### Example: Full configuration

```js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "@imagekit/strapi-provider-upload",
      providerOptions: {
        publicKey: env("IMAGEKIT_PUBLIC_KEY"),
        privateKey: env("IMAGEKIT_PRIVATE_KEY"),
        urlEndpoint: env("IMAGEKIT_URL_ENDPOINT"),
        useSignedUrls: false,
      },
      actionOptions: {
        upload: {
          ignoreStrapiFolders: false,
          folder: "strapi/uploads",
          tags: ["strapi", "imagekit"],
          // ...other ImageKit options
        },
        uploadStream: {
          ignoreStrapiFolders: false,
          folder: "strapi/uploads",
          tags: ["strapi", "imagekit"],
          // ...other ImageKit options
        },
      },
    },
  },
});
```

### Advanced Usage

You can pass any valid [ImageKit upload options](https://imagekit.io/docs/api-reference/upload-file/upload-file#request-body) in actionOptions.upload or actionOptions.uploadStream. For example: tags, customMetadata, transformation, etc.


### Security & CSP

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object below instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...other middlewares
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": ["'self'", "data:", "blob:", "market-assets.strapi.io", "ik.imagekit.io"],
          "media-src": ["'self'", "data:", "blob:", "market-assets.strapi.io", "ik.imagekit.io"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...other middlewares
];
```

## Resources

- [LICENSE](LICENSE)

## Links

- [ImageKit.io](https://imagekit.io/)
- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)
- [Strapi community on Discord](https://discord.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)

## Troubleshooting
- Ensure your API keys and URL endpoint are correct.
- If uploads are not appearing in the expected folder, check your ignoreStrapiFolders and folder options.
- For private files, set useSignedUrls to true and ensure proper permissions in your ImageKit dashboard.

## Contributing
PRs and issues are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).