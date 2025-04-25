const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const routes = require('./routes');
const morgan = require('morgan');
const winston = require('./utils/logger'); // Custom logger
require('dotenv').config(); // Load environment variables

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

// Logging middleware
const env = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  app.use(
    morgan(env === 'production' ? 'combined' : 'dev', {
      stream: {
        write: (message) => winston.debug(message.trim()), // Use debug for HTTP logs
      },
      skip: (req) => req.url === '/up', // Skip health check logs
    }),
  );
}

winston.info(`Server running in ${env} mode`);

// Swagger setup
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
winston.info('Swagger API documentation available at /api-docs');

// Routes
app.use(routes);
winston.info('Routes initialized.');

// Handle 404 errors
app.use((req, res) => {
  winston.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  winston.error(`Internal Server Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
