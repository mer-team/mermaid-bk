const request = require('supertest');
const express = require('express');
const songRoutes = require('../../src/routes/songRoutes');
const SongController = require('../../src/controllers/SongController');
const middleware = require('../../src/middleware');

// Mock the SongController and middleware
jest.mock('../../src/controllers/SongController');
jest.mock('../../src/middleware', () => ({
  validateToken: jest.fn((req, res, next) => next()),
  songValidationRules: {
    filter: [],
  },
  validate: jest.fn((req, res, next) => next()),
}));

describe('Song Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', songRoutes);

    // Mock controller methods with simple implementations
    SongController.index.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.show.mockImplementation((req, res) =>
      res.status(200).json({ song: { id: 1 } })
    );
    SongController.filterByName.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.filterByEmotion.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.filterByAll.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.updateHits.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Hits updated' })
    );
    SongController.getHits.mockImplementation((req, res) =>
      res.status(200).json({ hits: 10 })
    );
    SongController.getQueueSongs.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.getQueueSongsByIp.mockImplementation((req, res) =>
      res.status(200).json({ songs: [] })
    );
    SongController.deleteSong.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Song deleted' })
    );
    SongController.getStreamedMinutes.mockImplementation((req, res) =>
      res.status(200).json({ minutes: 120 })
    );
    SongController.AnalysedVideos.mockImplementation((req, res) =>
      res.status(200).json({ count: 5 })
    );
    SongController.getLatestClassifications.mockImplementation((req, res) =>
      res.status(200).json({ classifications: [] })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Song Endpoints', () => {
    test('GET / should call SongController.index', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(SongController.index).toHaveBeenCalled();
    });

    test('GET /:id should call SongController.show', async () => {
      const response = await request(app).get('/123');

      expect(response.status).toBe(200);
      expect(SongController.show).toHaveBeenCalled();
    });
  });

  describe('Song Filtering Routes', () => {
    test('GET /filter/name/:title should call SongController.filterByName', async () => {
      const response = await request(app).get('/filter/name/test-song');

      expect(response.status).toBe(200);
      expect(middleware.validate).toHaveBeenCalled();
      expect(SongController.filterByName).toHaveBeenCalled();
    });

    test('GET /filter/emotion/:emotion should call SongController.filterByEmotion', async () => {
      const response = await request(app).get('/filter/emotion/happy');

      expect(response.status).toBe(200);
      expect(middleware.validate).toHaveBeenCalled();
      expect(SongController.filterByEmotion).toHaveBeenCalled();
    });

    test('GET /filter/name/:title/emotion/:emotion should call SongController.filterByAll', async () => {
      const response = await request(app).get(
        '/filter/name/test-song/emotion/happy'
      );

      expect(response.status).toBe(200);
      expect(middleware.validate).toHaveBeenCalled();
      expect(SongController.filterByAll).toHaveBeenCalled();
    });
  });

  describe('Song Statistics and User-specific Routes', () => {
    test('POST /:song_id/hits should call SongController.updateHits', async () => {
      const response = await request(app).post('/123/hits');

      expect(response.status).toBe(200);
      expect(SongController.updateHits).toHaveBeenCalled();
    });

    test('GET /:song_id/hits should call SongController.getHits', async () => {
      const response = await request(app).get('/123/hits');

      expect(response.status).toBe(200);
      expect(SongController.getHits).toHaveBeenCalled();
    });
  });

  describe('Protected Routes', () => {
    test('GET /user/:user_id/queue should call SongController.getQueueSongs', async () => {
      const response = await request(app).get('/user/123/queue');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongController.getQueueSongs).toHaveBeenCalled();
    });

    test('GET /ip/queue should call SongController.getQueueSongsByIp', async () => {
      const response = await request(app).get('/ip/queue');

      expect(response.status).toBe(200);
      expect(SongController.getQueueSongsByIp).toHaveBeenCalled();
    });

    test('DELETE /:id should call SongController.deleteSong', async () => {
      const response = await request(app).delete('/123');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongController.deleteSong).toHaveBeenCalled();
    });
  });

  describe('Analytics Routes', () => {
    test('GET /stats/streamed-minutes should call SongController.getStreamedMinutes', async () => {
      const response = await request(app).get('/stats/streamed-minutes');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongController.getStreamedMinutes).toHaveBeenCalled();
    });

    test('GET /stats/analyzed-videos should call SongController.AnalysedVideos', async () => {
      const response = await request(app).get('/stats/analyzed-videos');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongController.AnalysedVideos).toHaveBeenCalled();
    });

    test('GET /stats/latest-classifications should call SongController.getLatestClassifications', async () => {
      const response = await request(app).get('/stats/latest-classifications');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(SongController.getLatestClassifications).toHaveBeenCalled();
    });
  });
});
