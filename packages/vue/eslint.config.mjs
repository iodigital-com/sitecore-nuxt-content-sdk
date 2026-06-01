import rootConfig from '../../eslint.config.mjs';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  ...rootConfig,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals['shared-node-browser'],
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/max-attributes-per-line': 'off',

      // .d.ts files are not meant to be executed, so we can ignore these rules
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // The use of v-html is intentional, because Sitecore delivers HTML content. Sitecore themselfs ensures that the content is safe.
      'vue/no-v-html': 'off',
      'vue/no-v-text-v-html-on-component': 'off',

      // The next rules conflict with prettier's formatting and don't provide significant value
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
];
