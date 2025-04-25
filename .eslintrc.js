module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  // parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  settings: {},
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ['prettier'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
  },
  overrides: [
    {
      files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
      rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^Sequelize$' }], // Ignore unused Sequelize variables
      },
    },
  ],
};
