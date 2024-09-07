const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const basename = path.basename(__filename);

// Load environment variables
require('dotenv').config();

// Construct the DATABASE_URL from environment variables
const databaseUrl = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Initialize Sequelize with the constructed database URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

// Initialize models
const db = {};

// Read and initialize models
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Set up associations if any
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
