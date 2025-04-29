const { configs } = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginSecurity = require('eslint-plugin-security');
const eslintPluginJest = require('eslint-plugin-jest');
const eslintPluginImport = require('eslint-plugin-import');

module.exports = [
  configs.recommended,
  prettierConfig,
  eslintPluginSecurity.configs.recommended,
  eslintPluginImport.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js global variables
        process: 'readonly',
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest global variables
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      prettier: eslintPluginPrettier,
      security: eslintPluginSecurity,
      jest: eslintPluginJest,
      import: eslintPluginImport,
    },
    rules: {
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      // Node.js specific rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-process-exit': 'error',
      'no-path-concat': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'consistent-return': 'error',
      // Import rules
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Security best practices
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
    },
    ignores: ['node_modules/**', 'build/**', 'dist/**', 'coverage/**'],
    files: ['src/**/*.js'],
    overrides: [
      {
        files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
        rules: {
          'no-unused-vars': ['error', { argsIgnorePattern: '^Sequelize$' }],
        },
      },
      // Jest test specific rules
      {
        files: ['tests/**/*.js', '**/*.test.js'],
        rules: {
          'jest/no-disabled-tests': 'warn',
          'jest/no-focused-tests': 'error',
          'jest/no-identical-title': 'error',
          'jest/prefer-to-have-length': 'warn',
          'jest/valid-expect': 'error',
        },
      },
    ],
  },
];
