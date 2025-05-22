module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/jest.setup.js'], // Global setup for Sequelize

  // Collect coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js', // Include all source files
    '!src/migrations/**', // Exclude migrations
    '!src/seeders/**', // Exclude seeders
    '!src/server.js', // Exclude server.js
  ],
  coverageDirectory: '<rootDir>/coverage', // Coverage folder inside `api`

  // Coverage reporters
  coverageReporters: ['text', 'html'],

  // Ignore specific paths for coverage
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/build/'],

  // Test file pattern
  testMatch: ['**/tests/**/*.test.js'], // Default test file pattern

  // Paths to ignore when looking for modules (resolves Haste module naming collision)
  modulePathIgnorePatterns: [
    '<rootDir>/tools/mock-services/dummy-service/',
    '<rootDir>/tools/mock-services/dummy-worker/',
    '<rootDir>/tools/mock-services/dummy-manager/',
  ],
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
};
