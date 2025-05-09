const { requestLogger } = require('../../src/middleware/logging.middleware');
const winston = require('../../src/utils/logger');

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Logging Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/test-path',
      clientIp: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test Agent',
      },
      path: '/test-path',
    };

    // Create a mock res object with a 'on' method to simulate the response events
    res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          // Immediately call the callback to simulate the 'finish' event
          callback();
        }
        return res;
      }),
    };

    next = jest.fn();

    // Reset all mocks before each test
    winston.info.mockReset();
    winston.warn.mockReset();

    // Mock Date.now to return consistent values for testing
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    // Restore Date.now
    jest.restoreAllMocks();
  });

  test('should log request information and call next()', () => {
    requestLogger(req, res, next);

    // Check that request was logged
    expect(winston.info).toHaveBeenCalledWith(
      `Request: GET /test-path`,
      expect.objectContaining({
        method: 'GET',
        url: '/test-path',
        ip: '127.0.0.1',
        userAgent: 'Jest Test Agent',
      })
    );

    // Check that next() was called
    expect(next).toHaveBeenCalled();
  });

  test('should log response information when request completes', () => {
    requestLogger(req, res, next);

    // Should log response info after the 'finish' event
    expect(winston.info).toHaveBeenCalledWith(
      `Response: 200 (0ms)`,
      expect.objectContaining({
        method: 'GET',
        url: '/test-path',
        statusCode: 200,
        duration: 0,
      })
    );
  });

  test('should use warn level for logging when response status is >= 400', () => {
    res.statusCode = 404;

    requestLogger(req, res, next);

    // Should use warn for error status codes
    expect(winston.warn).toHaveBeenCalledWith(
      `Response: 404 (0ms)`,
      expect.any(Object)
    );
  });

  test('should skip logging for health check routes', () => {
    req.path = '/up';

    requestLogger(req, res, next);

    // Should skip logging but still call next()
    expect(winston.info).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
