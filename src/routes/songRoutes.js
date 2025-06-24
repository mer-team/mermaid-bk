const express = require('express');

const SongController = require('../controllers/SongController');
const {
  validateToken,
  songValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Song:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         external_id:
 *           type: string
 *           example: dQw4w9WgXcQ
 *         link:
 *           type: string
 *           example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *         title:
 *           type: string
 *           example: Rick Astley - Never Gonna Give You Up (Official Music Video)
 *         artist:
 *           type: string
 *           example: Rick Astley
 *         duration:
 *           type: string
 *           format: date-time
 *           example: 1970-01-01T00:03:32.000Z
 *         year:
 *           type: integer
 *           example: 1987
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2009-10-25T00:00:00.000Z
 *         genre:
 *           type: string
 *           example: Dance-pop, Blue-eyed soul, Pop
 *         description:
 *           type: string
 *           example: "Never Gonna Give You Up official music video."
 *         thumbnailHQ:
 *           type: string
 *           example: https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg
 *         thumbnailMQ:
 *           type: string
 *           example: https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg
 *         hits:
 *           type: integer
 *           example: 123
 *         waveform:
 *           type: string
 *           example: dQw4w9WgXcQ.png
 *         status:
 *           type: string
 *           enum: [queued, processing, processed, error, cancelled]
 *           example: processed
 *         added_by_ip:
 *           type: string
 *           example: 1.1.1.1
 *         added_by_user:
 *           type: string
 *           example: "42"
 *         general_classification:
 *           type: string
 *           example: Happy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T12:00:00.000Z
 */

/**
 * @swagger
 * /songs:
 *   get:
 *     summary: Get all songs
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: List of songs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *             example:
 *               songs:
 *                 - id: 1
 *                   external_id: dQw4w9WgXcQ
 *                   title: Rick Astley - Never Gonna Give You Up (Official Music Video)
 *                   artist: Rick Astley
 *                   duration: 1970-01-01T00:03:32.000Z
 *                   year: 1987
 *                   date: 2009-10-25T00:00:00.000Z
 *                   genre: Dance-pop, Blue-eyed soul, Pop
 *                   description: "Never Gonna Give You Up official music video."
 *                   thumbnailHQ: https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg
 *                   thumbnailMQ: https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg
 *                   hits: 123
 *                   waveform: dQw4w9WgXcQ.png
 *                   status: processed
 *                   added_by_ip: 1.1.1.1
 *                   added_by_user: "42"
 *                   general_classification: Happy
 *                   createdAt: 2023-01-01T12:00:00.000Z
 *                   updatedAt: 2023-01-02T12:00:00.000Z
 *                 - id: 2
 *                   external_id: xYz123AbC
 *                   title: Queen – Bohemian Rhapsody (Official Video)
 *                   artist: Queen
 *                   duration: 1975-10-31T00:05:55.000Z
 *                   year: 1975
 *                   date: 2018-08-01T00:00:00.000Z
 *                   genre: Rock, Progressive rock
 *                   description: "Bohemian Rhapsody official music video."
 *                   thumbnailHQ: https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg
 *                   thumbnailMQ: https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg
 *                   hits: 456
 *                   waveform: fJ9rUzIMcZQ.png
 *                   status: processed
 *                   added_by_ip: 2.2.2.2
 *                   added_by_user: "99"
 *                   general_classification: Epic
 *                   createdAt: 2023-02-01T12:00:00.000Z
 *                   updatedAt: 2023-02-02T12:00:00.000Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching songs
 */
router.get('/', SongController.index);

/**
 * @swagger
 * /songs/{id}:
 *   get:
 *     summary: Get a specific song by ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Song details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 song:
 *                   $ref: '#/components/schemas/Song'
 *             example:
 *               song:
 *                 id: 1
 *                 external_id: dQw4w9WgXcQ
 *                 title: Rick Astley - Never Gonna Give You Up (Official Music Video)
 *                 artist: Rick Astley
 *                 duration: 1970-01-01T00:03:32.000Z
 *                 year: 1987
 *                 date: 2009-10-25T00:00:00.000Z
 *                 genre: Dance-pop, Blue-eyed soul, Pop
 *                 description: "Never Gonna Give You Up official music video."
 *                 thumbnailHQ: https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg
 *                 thumbnailMQ: https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg
 *                 hits: 123
 *                 waveform: dQw4w9WgXcQ.png
 *                 status: processed
 *                 added_by_ip: 1.1.1.1
 *                 added_by_user: "42"
 *                 general_classification: Happy
 *                 createdAt: 2023-01-01T12:00:00.000Z
 *                 updatedAt: 2023-01-02T12:00:00.000Z
 *       404:
 *         description: Song not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching song
 *   delete:
 *     summary: Delete a song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Song deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Song deleted
 *       404:
 *         description: Song not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 */
router.get('/:id', SongController.show);
router.delete('/:id', validateToken, SongController.deleteSong);

/**
 * @swagger
 * /songs/{song_id}/hits:
 *   post:
 *     summary: Update song hit count
 *     operationId: updateSongHits
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Hit count updated
 *         content:
 *           application/json:
 *             example:
 *               message: Hit updated
 *       404:
 *         description: Song not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error updating hits
 *   get:
 *     summary: Get song hit count
 *     operationId: getSongHits
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Hit count retrieved
 *         content:
 *           application/json:
 *             example:
 *               hits: 123
 *       404:
 *         description: Song not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching hits
 */
router.post('/:song_id/hits', SongController.updateHits);
router.get('/:song_id/hits', SongController.getHits);

/**
 * @swagger
 * /songs/filter/name/{title}:
 *   get:
 *     summary: Filter songs by title
 *     operationId: filterSongsByTitle
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Song title
 *     responses:
 *       200:
 *         description: List of filtered songs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *             example:
 *               songs:
 *                 - { ... }
 *       400:
 *         description: Invalid title
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid title
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error filtering songs by name
 */
router.get(
  '/filter/name/:title',
  songValidationRules.filter,
  validate,
  SongController.filterByName
);

/**
 * @swagger
 * /songs/filter/emotion/{emotion}:
 *   get:
 *     summary: Filter songs by emotion
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: emotion
 *         required: true
 *         schema:
 *           type: string
 *         description: Emotion type
 *     responses:
 *       200:
 *         description: List of filtered songs
 */
router.get(
  '/filter/emotion/:emotion',
  songValidationRules.filter,
  validate,
  SongController.filterByEmotion
);

/**
 * @swagger
 * /songs/filter/name/{title}/emotion/{emotion}:
 *   get:
 *     summary: Filter songs by title and emotion
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Song title
 *       - in: path
 *         name: emotion
 *         required: true
 *         schema:
 *           type: string
 *         description: Emotion type
 *     responses:
 *       200:
 *         description: List of filtered songs
 */
router.get(
  '/filter/name/:title/emotion/:emotion',
  songValidationRules.filter,
  validate,
  SongController.filterByAll
);

/**
 * @swagger
 * /songs/user/{user_id}/queue:
 *   get:
 *     summary: Get user-specific song queue
 *     operationId: getUserSongQueue
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of songs in the queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *             example:
 *               songs:
 *                 - { ... }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching queued songs
 */
router.get('/user/:user_id/queue', validateToken, SongController.getQueueSongs);

/**
 * @swagger
 * /songs/ip/queue:
 *   get:
 *     summary: Get song queue by IP
 *     operationId: getSongQueueByIp
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: List of songs in the queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *             example:
 *               songs:
 *                 - { ... }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching queued songs by IP
 */
router.get('/ip/queue', SongController.getQueueSongsByIp);

/**
 * @swagger
 * /songs/stats/streamed-minutes:
 *   get:
 *     summary: Get total streamed minutes
 *     operationId: getStreamedMinutes
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total streamed minutes
 *         content:
 *           application/json:
 *             example:
 *               totalStreamedMinutes: 123
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error calculating streamed minutes
 */
router.get(
  '/stats/streamed-minutes',

  SongController.getStreamedMinutes
);

/**
 * @swagger
 * /songs/stats/analyzed-videos:
 *   get:
 *     summary: Get total analyzed videos
 *     operationId: getAnalyzedVideos
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total analyzed videos
 *         content:
 *           application/json:
 *             example:
 *               totalAnalysedVideos: 42
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching analysed videos
 */
router.get(
  '/stats/analysed-videos',

  SongController.AnalysedVideos
);

/**
 * @swagger
 * /songs/stats/latest-classifications:
 *   get:
 *     summary: Get latest classifications
 *     operationId: getLatestClassifications
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest classifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 *             example:
 *               - { ... }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching latest classifications
 */
router.get(
  '/stats/latest-classifications',
  validateToken,
  SongController.getLatestClassifications
);

module.exports = router;
