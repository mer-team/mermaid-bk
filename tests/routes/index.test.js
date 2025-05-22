const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/index');
const { sendMessage } = require('../../src/services/rabbitmqService');

// Mock the RabbitMQ service
jest.mock('../../src/services/rabbitmqService', () => ({
  sendMessage: jest.fn().mockResolvedValue(true),
}));

describe('Routes Index', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
    jest.clearAllMocks();
  });

  describe('Health Check Route', () => {
    it('GET /health should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('RabbitMQ Route', () => {
    it('GET /queue/send should send a message to RabbitMQ and return 200', async () => {
      const response = await request(app).get('/queue/send');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Message sent to RabbitMQ');
      expect(sendMessage).toHaveBeenCalledWith(
        'videoDownloadQueue',
        JSON.stringify({
          url: 'https://example.com/video',
          format: 'mp4',
        })
      );
    });

    it('GET /queue/send should return 500 when RabbitMQ service fails', async () => {
      sendMessage.mockRejectedValueOnce(
        new Error('RabbitMQ connection failed')
      );

      const response = await request(app).get('/queue/send');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to send message to RabbitMQ');
    });
  });

  describe('Up Route', () => {
    it('GET /up should return 200 and json status', async () => {
      const response = await request(app).get('/up');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
