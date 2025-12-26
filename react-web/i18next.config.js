import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  extract: {
    input: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    output: 'public/locales/{{language}}/translation.json',
  },
  // Lint configuration
  functions: ['t', 'i18n.t', '*.t'],
  transComponents: ['Trans', 'Translation'],
  ignoredAttributes: ['data-testid', 'aria-label', 'className', 'id', 'key', 'ref'],
  ignoredTags: ['pre', 'code', 'script', 'style'],
  keySeparator: false,
  namespaceSeparator: false,
});
