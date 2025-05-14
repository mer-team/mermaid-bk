const request = require('supertest');
const express = require('express');
const router = require('../../src/routes');
const { sendMessage } = require('../../src/Services/rabbitmqService');

// Mock the rabbitmqService
jest.mock('../../src/Services/rabbitmqService', () => ({
  sendMessage: jest.fn(),
}));

describe('Routes Index', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Route', () => {
    test('GET /up should return status 200 and "ok" message', async () => {
      const response = await request(app).get('/up');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('RabbitMQ Route', () => {
    test('GET /queue/send should send a message to RabbitMQ and return 200', async () => {
      sendMessage.mockResolvedValue();

      const response = await request(app).get('/queue/send');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Message sent to RabbitMQ');
      expect(sendMessage).toHaveBeenCalledWith(
        'videoDownloadQueue',
        'Test message from /send route'
      );
    });

    test('GET /queue/send should return 500 when RabbitMQ fails', async () => {
      sendMessage.mockRejectedValue(new Error('RabbitMQ connection failed'));

      const response = await request(app).get('/queue/send');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to send message to RabbitMQ');
    });
  });
});
