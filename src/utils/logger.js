/**
 * Logger Configuration
 *
 * This module configures Winston for logging based on the current environment:
 * - Development: Verbose logging to help with debugging
 * - Test: Minimal logging to keep test output clean
 * - Production: Structured logging for better analysis
 */
const { createLogger, format, transports } = require('winston');

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Configure log level based on environment
const getLogLevel = () => {
  switch (env) {
    case 'production':
      return 'info'; // Less verbose in production
    case 'test':
      return 'error'; // Only errors during tests
    default:
      return 'debug'; // Verbose in development
  }
};

// Create and export logger
const logger = createLogger({
  level: getLogLevel(),
  format: format.combine(
    format.timestamp(),
    // For production, use JSON format for better log processing
    env === 'production'
      ? format.json()
      : format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`,
        ),
  ),
  transports: [
    // Console output - silent in test mode
    new transports.Console({
      silent: env === 'test',
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`,
        ),
      ),
    }),
    // Always log errors to file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      // Maximum size for log files
      maxsize: 10485760, // 10MB
      maxFiles: 3,
    }),
    // General logs (development and production only)
    ...(env !== 'test'
      ? [
          new transports.File({
            filename: 'logs/app.log',
            maxsize: 10485760, // 10MB
            maxFiles: 3,
          }),
        ]
      : []),
  ],
});

// Log initialization message
logger.info(`Logger initialized in ${env} mode`);

module.exports = logger;
