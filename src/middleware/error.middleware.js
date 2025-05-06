/**
 * Error handling middleware functions
 */
const { validationResult } = require('express-validator');

const winston = require('../utils/logger');

/**
 * Global error handler middleware
 * Formats and sends error responses consistently
 */
const errorHandler = (err, req, res, _next) => {
  // Log the error
  winston.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.clientIp,
  });

  // Default status is 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    status: statusCode,
    path: req.originalUrl,
  });
};

/**
 * 404 Not Found handler
 * Must be registered after all routes
 */
const notFoundHandler = (req, res) => {
  winston.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    error: 'Not Found',
    status: 404,
    path: req.originalUrl,
  });
};

/**
 * Request validation error handler
 * For handling validation errors from express-validator
 */
const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      status: 400,
      details: errors.array(),
    });
  }

  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
};
