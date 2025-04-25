/**
 * Formats successful API responses
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in response
 * @param {number} statusCode - HTTP status code
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Formats error API responses
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = {
  success,
  error,
};
