const { sequelize } = require('../src/models');

// Global setup for Jest
beforeAll(async () => {
  try {
    await sequelize.authenticate(); // Ensure the database connection is valid
  } catch (error) {
    console.error('❌ Failed to set up global test environment:', error);
    throw error; // Fail the tests if setup fails
  }
});

afterAll(async () => {
  try {
    await sequelize.close(); // Properly close Sequelize connection
  } catch (error) {
    console.error('❌ Failed to tear down global test environment:', error);
    throw error; // Fail the tests if teardown fails
  }
});
