module.exports = {
  root: true,
  extends: [
    '@strapi/eslint-config/back/typescript' /*'plugin:@typescript-eslint/recommended-requiring-type-checking'*/,
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-rxjs'],
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
  },
  globals: {
    strapi: false,
  },
  rules: {
    ...require('./index').rules,
    'rxjs/finnish': 'error',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': 'off',
    'import/prefer-default-export': 'off',
    'import/namespace': 'off',
    '@typescript-eslint/brace-style': 'off', // TODO: fix conflict with prettier/prettier in data-transfer/engine/index.ts
    // to be cleaned up throughout codebase (too many to fix at the moment)
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/naming-convention': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['**.test.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'warn', // as long as javascript is allowed in our codebase, we want to test erroneous typescript usage
      },
    },
  ],
};