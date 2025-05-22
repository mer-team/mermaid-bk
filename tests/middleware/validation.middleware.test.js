const { validationResult } = require('express-validator');
const {
  validate,
  userValidationRules,
  songValidationRules,
  feedbackValidationRules,
} = require('../../src/middleware/validation.middleware');

// Enhanced mock for express-validator
jest.mock('express-validator', () => {
  // Create a chainable mock function that returns itself
  const chainableMock = () => {
    const mock = jest.fn().mockReturnThis();
    // Add all the common validator methods
    mock.trim = jest.fn().mockReturnThis();
    mock.isEmail = jest.fn().mockReturnThis();
    mock.isLength = jest.fn().mockReturnThis();
    mock.withMessage = jest.fn().mockReturnThis();
    mock.matches = jest.fn().mockReturnThis();
    mock.normalizeEmail = jest.fn().mockReturnThis();
    mock.isIn = jest.fn().mockReturnThis();
    mock.not = jest.fn().mockReturnThis();
    mock.isEmpty = jest.fn().mockReturnThis();
    mock.optional = jest.fn().mockReturnThis();
    mock.isString = jest.fn().mockReturnThis();
    mock.isInt = jest.fn().mockReturnThis();
    mock.custom = jest.fn().mockReturnThis();
    mock.notEmpty = jest.fn().mockReturnThis();
    return mock;
  };

  return {
    body: chainableMock,
    param: chainableMock,
    query: chainableMock,
    validationResult: jest.fn(),
  };
});

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
