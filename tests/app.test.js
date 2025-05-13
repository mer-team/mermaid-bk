const request = require('supertest');
const app = require('../../src/app');
const routes = require('../../src/routes/index');
const {
  requestLogger,
  errorHandler,
  notFoundHandler,
} = require('../../src/middleware');

// Mock dependencies
jest.mock('../../src/routes');
jest.mock('../../src/middleware', () => ({
  requestLogger: jest.fn((req, res, next) => next()),
  errorHandler: jest.fn((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  }),
  notFoundHandler: jest.fn((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  }),
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Express App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should use CORS middleware', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://example.com');

    // Check for CORS headers
    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });

  test('should use JSON parsing middleware', async () => {
    routes.get.mockImplementation((path, handler) => {
      if (path === '/test-json') {
        return handler;
      }
    });

    // Register a test route
    app.get('/test-json', (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app).get('/test-json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  test('should handle 404 errors', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('should handle server errors', async () => {
    // Register a route that throws an error
    app.get('/error', (req, res, next) => {
      const error = new Error('Test error');
      next(error);
    });

    const response = await request(app).get('/error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Test error' });
  });
});
