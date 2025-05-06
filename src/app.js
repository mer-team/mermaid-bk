const cors = require('cors');
const express = require('express');
const requestIp = require('request-ip');
const swaggerUI = require('swagger-ui-express');

const {
  requestLogger,
  errorHandler,
  notFoundHandler,
} = require('./middleware');
const routes = require('./routes');
const swaggerDocs = require('./swagger.json');
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
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
winston.info('Swagger API documentation available at /api-docs');

// Routes - Using the new modular routes structure
app.use('/', routes);
winston.info('Routes initialized.');

// Error handling middleware (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
