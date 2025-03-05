[<img width="250" alt="ImageKit.io" src="https://raw.githubusercontent.com/imagekit-developer/imagekit-javascript/master/assets/imagekit-light-logo.svg"/>](https://imagekit.io)

# Strapi upload provider for ImageKit.io

[![Node CI](https://github.com/imagekit-developer/imagekit-next/workflows/Node%20CI/badge.svg)](https://github.com/imagekit-developer/strapi-provider-upload-imagekitio/)
[![npm version](https://img.shields.io/npm/v/strapi-provider-upload-imagekitio)](https://www.npmjs.com/package/strapi-provider-upload-imagekitio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/imagekitio?label=Follow&style=social)](https://twitter.com/ImagekitIo)

A Strapi provider for [ImageKit.io](https://imagekit.io/) allows you to upload assets directly to the ImageKit media library from Strapi and also delete them.

ImageKit is a complete media storage, optimization, and transformation solution that comes with an image and video CDN. It can be integrated with your existing infrastructure - storage like AWS S3, web servers, your CDN, and custom domain names, allowing you to deliver optimized images in minutes with minimal code changes.

## Installation

Add the provider to your project by executing any of the below commands.

```bash
# using yarn
yarn add strapi-provider-upload-imagekitio

# using npm
npm install strapi-provider-upload-imagekitio --save
```

## Configuration

To make our provider work, we need to add a configuration in the `./config/plugins.js` file. The configuration should include the following parameters, as described below.

- `provider`: Specifies the name of the provider.
- `providerOptions`: Contains the options required to configure the provider.
    * `urlEndpoint`: A required parameter that can be obtained from the [URL-endpoint section](https://imagekit.io/dashboard/url-endpoints) or the [developer section](https://imagekit.io/dashboard/developer/api-keys) on your ImageKit dashboard.
    * `publicKey` and `privateKey`: Required parameters that can be retrieved from the [developer section](https://imagekit.io/dashboard/developer/api-keys) on your ImageKit dashboard.
    * `uploadOptions` is an optional parameter that accepts upload parameters supported by the [ImageKit Upload API](https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload). The following parameters are supported by the provider: `folder`, `useUniqueFileName`, `tags`, `checks`, `isPrivateFile`, `customCoordinates`, `webhookUrl`, `extensions`, `transformation`, and `customMetadata`.

For more information about using a provider, refer to the [documentation about using a provider](https://docs.strapi.io/dev-docs/providers). To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment).

### Provider Configuration

Below is an example of how to configure the provider in `./config/plugins.js`.

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-imagekitio",
      providerOptions: {
        publicKey: env("PUBLIC_KEY"),
        privateKey: env("PRIVATE_KEY"),
        urlEndpoint: env("URL_ENDPOINT"),

        // Optional
        uploadOptions: {
          folder: "/path",
          useUniqueFileName: true,
          tags: ["tag1", "tag2"],
          checks: `"file.size" < "1mb"`,
          isPrivateFile: false,
          customCoordinates: "1,2,3,4",
          webhookUrl: "https://testwebook.com",
          extensions: [
          {
              name: "google-auto-tagging",
              maxTags: 5,
              minConfidence: 95,
          },
          ],
          transformation: {
          pre: "l-text,i-Imagekit,fs-50,l-end",
          post: [
              {
              type: "transformation",
              value: "l-text,i-Imagekit,fs-50,l-end",
              },
          ],
          },
          customMetadata: { test: "value" },
        },
      },
    },
  },
  // ...
});
```

### Security Middleware Configuration

The default settings in Strapi's Security Middleware require modifications to the `contentSecurityPolicy` settings to ensure thumbnail previews are visible in the Media Library. Replace the `strapi::security` string with the object provided below, as detailed in the [middleware configuration documentation](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order).

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'ik.imagekit.io'],
          'media-src': ["'self'", 'data:', 'blob:', 'ik.imagekit.io'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```