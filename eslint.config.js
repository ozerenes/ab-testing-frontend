import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  { ignores: ['**/*.d.ts', '**/coverage', '**/dist', '**/node_modules'] },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        parser: typescriptEslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      ...eslintPluginPrettier.configs.recommended.rules,
    },
  },
  eslintConfigPrettier
)
