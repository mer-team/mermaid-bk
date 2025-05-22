const cors = require('cors');
const express = require('express');
const requestIp = require('request-ip');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { requestLogger } = require('./middleware');
const { errorHandler } = require('./middleware');
const { notFoundHandler } = require('./middleware/error.middleware');
const routes = require('./routes');
const winston = require('./utils/logger');
require('dotenv').config();

/**
 * Express Application Setup
 *
 * This file configures the Express application with:
 * - Middleware (JSON parsing, logging, etc.)
 * - API documentation via Swagger
 * - Route handlers
 * - Error handling
 */

const app = express();

// Middleware
winston.info('Initializing middleware...');
app.use(cors());
app.use(requestIp.mw()); // Middleware to get the IP of the user
app.use(express.json()); // Parse JSON requests

// Custom request logging
app.use(requestLogger);

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mermaid API',
    version: '0.3.0',
    description:
      'API documentation for the MERmaid Music Emotion Recognition system',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
winston.info('Swagger API documentation available at /api-docs');

// Routes - Using the new modular routes structure
app.use('/', routes);
winston.info('Routes initialized.');

// Error handling middleware (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
