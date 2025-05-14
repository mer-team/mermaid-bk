const jwt = require('jsonwebtoken');
const {
  validateToken,
  requireAdmin,
} = require('../../src/middleware/auth.middleware');

// Mock environment variables and jwt
jest.mock('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret';

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jwt.verify.mockReset();
  });

  describe('validateToken middleware', () => {
    test('should call next() with valid token', () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { id: 123, role: 'user' });
      });

      validateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        'test-secret',
        expect.any(Function),
      );
      expect(req.userId).toBe(123);
      expect(req.userRole).toBe('user');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 when authorization header is missing', () => {
      req.headers = {};
      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when authorization format is invalid', () => {
      req.headers.authorization = 'invalid-format';
      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token error' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when authorization scheme is not Bearer', () => {
      req.headers.authorization = 'Basic valid-token';
      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token malformatted' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when token verification fails', () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      validateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        'test-secret',
        expect.any(Function),
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin middleware', () => {
    test('should call next() if user is admin', () => {
      req.userRole = 'admin';
      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 403 if user is not admin', () => {
      req.userRole = 'user';
      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
