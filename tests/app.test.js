const request = require('supertest');
const app = require('../src/app');

// Mock dependencies
jest.mock('../src/routes', () => {
  const express = require('express');
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/up', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return router;
});
jest.mock('../src/middleware', () => ({
  requestLogger: jest.fn((req, res, next) => next()),
  errorHandler: jest.fn((err, req, res, _next) => {
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  }),
}));

describe('App', () => {
  it('should set up middleware and routes correctly', () => {
    expect(app).toBeDefined();
  });

  it('should return 404 for undefined routes', async () => {
    const response = await request(app).get('/not-found');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
