/**
 * Request validation middleware using express-validator
 */
const { body, param, validationResult } = require('express-validator');

/**
 * User validation rules
 */
const userValidationRules = {
  // Signup validation
  signup: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],

  // Login validation
  login: [
    body('email').isEmail().withMessage('Must provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  // Password change validation
  passwordChange: [
    body('currentPassword')
      .not()
      .isEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
};

/**
 * Song validation rules
 */
const songValidationRules = {
  // Classification validation
  classification: [
    param('external_id').not().isEmpty().withMessage('Song ID is required'),
    param('user_id').not().isEmpty().withMessage('User ID is required'),
    body('emotion')
      .isIn(['Happy', 'Sad', 'Energetic', 'Calm', 'Angry'])
      .withMessage('Invalid emotion type'),
  ],

  // Song filter validation
  filter: [
    param('emotion')
      .optional()
      .isIn(['Happy', 'Sad', 'Energetic', 'Calm', 'Angry'])
      .withMessage('Invalid emotion type'),
    param('title').optional().isString().withMessage('Title must be a string'),
  ],
};

/**
 * Feedback validation rules
 */
const feedbackValidationRules = {
  // Feedback submission validation
  submit: [
    param('song_id').not().isEmpty().withMessage('Song ID is required'),
    param('user_id').not().isEmpty().withMessage('User ID is required'),
    param('agreeordisagree')
      .isIn(['agree', 'disagree'])
      .withMessage('Feedback must be either agree or disagree'),
  ],
};

/**
 * Validation middleware that checks for validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  songValidationRules,
  feedbackValidationRules,
  validate,
};
