import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginSecurity from 'eslint-plugin-security';
import pluginJest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base configuration (shared across all projects)
  {
    files: ['**/*.{js, mjs}'],
    languageOptions: {
      sourceType: 'commonjs', // Use CommonJS for Node.js
      globals: {
        ...globals.node, // Node.js globals
      },
    },
    plugins: { prettier: prettierPlugin, security: pluginSecurity },
    rules: {
      ...pluginJs.configs.recommended.rules, // Base JavaScript rules
      ...pluginSecurity.configs.recommended.rules, // Security rules for Node.js
      ...prettierConfig.rules, // Disable conflicting ESLint rules
      'prettier/prettier': 'error', // Enforce Prettier formatting
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused variables starting with "_"
    },
  },

  // Ignore common directories
  {
    ignores: [
      'node_modules',
      'coverage',
      '.dockerignore',
      '.husky',
      '.prettier-cache',
      '.eslintcache',
      '.vscode',
    ],
  },
  // Overrides for Sequelize migrations and seeders in the API
  {
    files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^Sequelize$' }], // Ignore unused Sequelize variables
    },
  },
  // Overrides for Test Files (shared across API and Web)
  {
    files: ['tests/**/*.js'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: {
        ...globals.jest, // Add Jest globals
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn', // Warn about skipped tests
      'jest/no-focused-tests': 'error', // Disallow focused tests
      'jest/no-identical-title': 'error', // Disallow duplicate test titles
      'jest/prefer-to-have-length': 'warn', // Suggest `.toHaveLength()` for array length assertions
      'jest/valid-expect': 'error', // Ensure `expect()` is used correctly
    },
  },
];
