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

      // .d.ts files are not meant to be executed, so we can ignore these rules
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
