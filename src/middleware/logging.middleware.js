/**
 * Request logging middleware
 */
const winston = require('../utils/logger');

/**
 * Logs incoming requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Skip logging health check requests to reduce noise
  if (req.path === '/up') {
    return next();
  }

  const start = Date.now();

  // Log request info
  winston.info(`Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.clientIp,
    userAgent: req.headers['user-agent'],
  });

  // Log response info after request is complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    winston[level](`Response: ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
    });
  });

  next();
};

module.exports = {
  requestLogger,
};
