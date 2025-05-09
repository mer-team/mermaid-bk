const { validationResult } = require('express-validator');
const {
  validate,
  userValidationRules,
  songValidationRules,
  feedbackValidationRules,
} = require('../../src/middleware/validation.middleware');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockReturnThis(),
  param: jest.fn().mockReturnThis(),
  validationResult: jest.fn(),
  isEmail: jest.fn().mockReturnThis(),
  trim: jest.fn().mockReturnThis(),
  normalizeEmail: jest.fn().mockReturnThis(),
  isLength: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  isEmpty: jest.fn().mockReturnThis(),
  isIn: jest.fn().mockReturnThis(),
  withMessage: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  isString: jest.fn().mockReturnThis(),
}));

describe('Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset validationResult mock for each test
    validationResult.mockReset();
  });

  describe('validate middleware', () => {
    test('should call next() when validation passes', () => {
      // Mock validation success
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      validate(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when validation fails', () => {
      // Mock validation errors
      const mockErrors = [
        { param: 'email', msg: 'Invalid email' },
        { param: 'password', msg: 'Password too short' },
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors),
      });

      validate(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Validation Rules', () => {
    test('userValidationRules.signup should contain required validations', () => {
      // This test verifies the structure of the validation rules
      expect(userValidationRules.signup).toBeDefined();
      expect(Array.isArray(userValidationRules.signup)).toBe(true);
      expect(userValidationRules.signup.length).toBeGreaterThan(0);
    });

    test('userValidationRules.login should contain required validations', () => {
      expect(userValidationRules.login).toBeDefined();
      expect(Array.isArray(userValidationRules.login)).toBe(true);
      expect(userValidationRules.login.length).toBeGreaterThan(0);
    });

    test('userValidationRules.passwordChange should contain required validations', () => {
      expect(userValidationRules.passwordChange).toBeDefined();
      expect(Array.isArray(userValidationRules.passwordChange)).toBe(true);
      expect(userValidationRules.passwordChange.length).toBeGreaterThan(0);
    });

    test('songValidationRules.classification should contain required validations', () => {
      expect(songValidationRules.classification).toBeDefined();
      expect(Array.isArray(songValidationRules.classification)).toBe(true);
      expect(songValidationRules.classification.length).toBeGreaterThan(0);
    });

    test('songValidationRules.filter should contain required validations', () => {
      expect(songValidationRules.filter).toBeDefined();
      expect(Array.isArray(songValidationRules.filter)).toBe(true);
      expect(songValidationRules.filter.length).toBeGreaterThan(0);
    });

    test('feedbackValidationRules.submit should contain required validations', () => {
      expect(feedbackValidationRules.submit).toBeDefined();
      expect(Array.isArray(feedbackValidationRules.submit)).toBe(true);
      expect(feedbackValidationRules.submit.length).toBeGreaterThan(0);
    });
  });
});
