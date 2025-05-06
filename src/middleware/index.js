/**
 * Middleware index file to export all middleware
 * This allows for cleaner imports in other files
 */

// Import middleware modules
const { validateToken, requireAdmin } = require('./auth.middleware');
const { errorHandler, notFoundHandler } = require('./error.middleware');
const { requestLogger } = require('./logging.middleware');
const {
  userValidationRules,
  songValidationRules,
  feedbackValidationRules,
  validate,
} = require('./validation.middleware');

// Export all middleware
module.exports = {
  // Authentication
  validateToken,
  requireAdmin,

  // Error handling
  errorHandler,
  notFoundHandler,

  // Logging
  requestLogger,

  // Validation
  validate,
  userValidationRules,
  songValidationRules,
  feedbackValidationRules,
};
