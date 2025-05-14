const request = require('supertest');
const express = require('express');
const feedbackRoutes = require('../../src/routes/feedbackRoutes');
const FeedbackController = require('../../src/controllers/FeedbackController');
const middleware = require('../../src/middleware');

// Mock the FeedbackController and middleware
jest.mock('../../src/controllers/FeedbackController');
jest.mock('../../src/middleware', () => ({
  validateToken: jest.fn((req, res, next) => next()),
  feedbackValidationRules: {
    submit: [],
  },
  validate: jest.fn((req, res, next) => next()),
}));

describe('Feedback Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', feedbackRoutes);

    // Mock controller methods with simple implementations
    FeedbackController.index.mockImplementation((req, res) =>
      res.status(201).json({ message: 'Feedback submitted' }),
    );
    FeedbackController.getTotalAgrees.mockImplementation((req, res) =>
      res.status(200).json({ agrees: 5 }),
    );
    FeedbackController.getTotalDisagrees.mockImplementation((req, res) =>
      res.status(200).json({ disagrees: 3 }),
    );
    FeedbackController.getUserOpinion.mockImplementation((req, res) =>
      res.status(200).json({ opinion: 'agree' }),
    );
    FeedbackController.undoFeedback.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Feedback removed' }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Submit Feedback Route', () => {
    test('POST /songs/:song_id/users/:user_id/:agreeordisagree should call FeedbackController.index', async () => {
      const response = await request(app)
        .post('/songs/123/users/456/agree')
        .send({});

      expect(response.status).toBe(201);
      expect(middleware.validate).toHaveBeenCalled();
      expect(FeedbackController.index).toHaveBeenCalled();
    });
  });

  describe('Get Feedback Statistics Routes', () => {
    test('GET /songs/:song_id/agrees should call FeedbackController.getTotalAgrees', async () => {
      const response = await request(app).get('/songs/123/agrees');

      expect(response.status).toBe(200);
      expect(FeedbackController.getTotalAgrees).toHaveBeenCalled();
    });

    test('GET /songs/:song_id/disagrees should call FeedbackController.getTotalDisagrees', async () => {
      const response = await request(app).get('/songs/123/disagrees');

      expect(response.status).toBe(200);
      expect(FeedbackController.getTotalDisagrees).toHaveBeenCalled();
    });

    test('GET /users/:user_id/songs/:song_id should call FeedbackController.getUserOpinion', async () => {
      const response = await request(app).get('/users/456/songs/123');

      expect(response.status).toBe(200);
      expect(FeedbackController.getUserOpinion).toHaveBeenCalled();
    });
  });

  describe('Delete Feedback Route', () => {
    test('DELETE /users/:user_id/songs/:song_id should call FeedbackController.undoFeedback', async () => {
      const response = await request(app).delete('/users/456/songs/123');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(FeedbackController.undoFeedback).toHaveBeenCalled();
    });
  });
});
