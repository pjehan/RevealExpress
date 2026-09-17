import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'test-results', 'playwright-report']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/client/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/server/**/*.ts', 'test/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['test/e2e/fixture/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  prettier,
]);
