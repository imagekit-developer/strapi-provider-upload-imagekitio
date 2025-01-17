# strapi-provider-upload-imagekitio

## Installation

```bash
# using yarn
yarn add strapi-provider-upload-imagekitio

# using npm
npm install strapi-provider-upload-imagekitio --save
```

## Configuration

- `provider`: Specifies the name of the provider.
- `providerOptions`: Contains the options required to configure the provider.
    * `urlEndpoint`: A required parameter that can be obtained from the [URL-endpoint section](https://imagekit.io/dashboard/url-endpoints) or the [developer section](https://imagekit.io/dashboard/developer/api-keys) on your ImageKit dashboard.
    * `publicKey` and `privateKey`: Required parameters that can be retrieved from the [developer section](https://imagekit.io/dashboard/developer/api-keys) on your ImageKit dashboard.
    * `uploadOptions` is an optional parameter that accepts upload parameters supported by the [ImageKit Upload API](https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload). The following parameters are supported by the provider: `folder`, `useUniqueFileName`, `tags`, `checks`, `isPrivateFile`, `customCoordinates`, `webhookUrl`, `extensions`, `transformation`, and `customMetadata`.


See the [documentation about using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) for information on installing and using a provider. To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Configuration

`./config/plugins.js`

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
      },

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