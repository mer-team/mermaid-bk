const request = require('supertest');
const express = require('express');
const classificationRoutes = require('../../src/routes/classificationRoutes');
const SongClassificationController = require('../../src/controllers/SongClassificationController');
const middleware = require('../../src/middleware');

// Mock the SongClassificationController and middleware
jest.mock('../../src/controllers/SongClassificationController');
jest.mock('../../src/middleware', () => ({
  validateToken: jest.fn((req, res, next) => next()),
  songValidationRules: {
    classification: [],
  },
  validate: jest.fn((req, res, next) => next()),
}));

describe('Classification Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', classificationRoutes);

    // Mock controller methods with simple implementations
    SongClassificationController.index.mockImplementation((req, res) =>
      res.status(200).json({ classifications: [] })
    );
    SongClassificationController.classify.mockImplementation((req, res) =>
      res.status(201).json({ message: 'Classification submitted' })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get All Classifications Route', () => {
    test('GET / should call SongClassificationController.index', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongClassificationController.index).toHaveBeenCalled();
    });
  });

  describe('Classify Song Route', () => {
    test('POST /songs/:external_id/users/:user_id should call SongClassificationController.classify', async () => {
      const classificationData = {
        happiness: 0.8,
        sadness: 0.1,
        energy: 0.7,
      };

      const response = await request(app)
        .post('/songs/abc123/users/456')
        .send(classificationData);

      expect(response.status).toBe(201);
      expect(middleware.validate).toHaveBeenCalled();
      expect(SongClassificationController.classify).toHaveBeenCalled();
    });
  });
});
