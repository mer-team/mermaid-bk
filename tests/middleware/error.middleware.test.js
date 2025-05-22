const {
  errorHandler,
  notFoundHandler,
} = require('../../src/middleware/error.middleware');
const winston = require('../../src/utils/logger');

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('Error Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: '/test-path',
      method: 'GET',
      clientIp: '127.0.0.1',
      originalUrl: '/test-original-url',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    winston.error.mockReset();
    winston.warn.mockReset();
  });

  describe('errorHandler middleware', () => {
    test('should return error response with status code from error', () => {
      const err = new Error('Test error message');
      err.statusCode = 400;

      errorHandler(err, req, res, next);

      expect(winston.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Test error message',
        status: 400,
        path: '/test-original-url',
      });
    });

    test('should use default 500 status if error has no status code', () => {
      const err = new Error('Internal server error');

      errorHandler(err, req, res, next);

      expect(winston.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        status: 500,
        path: '/test-original-url',
      });
    });

    test('should use default error message if error has no message', () => {
      const err = new Error();
      err.message = undefined;

      errorHandler(err, req, res, next);

      expect(winston.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        status: 500,
        path: '/test-original-url',
      });
    });
  });

  describe('notFoundHandler middleware', () => {
    test('should return 404 Not Found response', () => {
      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
        status: 404,
        path: '/test-original-url',
      });
    });
  });
});
