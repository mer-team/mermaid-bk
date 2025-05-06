const securityPlugin = require('eslint-plugin-security');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.js'],
    plugins: {
      security: securityPlugin,
      jest: jestPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Best practices
      'no-console': 'warn',
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Style
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      indent: ['error', 2],
      'arrow-spacing': 'error',
      'object-curly-spacing': ['error', 'always'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'no-trailing-spaces': 'error',
      'max-len': ['warn', { code: 100, ignoreUrls: true }],

      // Import
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],

      // Security best practices
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
    },
  },
  // Override for migration and seeder files
  {
    files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^Sequelize$' }],
    },
  },
  // Override for Jest test files
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
