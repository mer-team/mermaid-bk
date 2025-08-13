const express = require('express');

const SongClassificationController = require('../controllers/SongClassificationController');
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
 *     Classification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         song_id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 42
 *         emotion:
 *           type: string
 *           example: Happy
 *         confidence:
 *           type: number
 *           format: float
 *           example: 0.85
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T12:00:00.000Z

/**
 * @swagger
 * /classifications:
 *   get:
 *     summary: Get all song classifications
 *     operationId: getAllClassifications
 *     tags: [Classifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Classification'
 *             example:
 *               classifications:
 *                 - id: 1
 *                   song_id: 1
 *                   user_id: 42
 *                   emotion: Happy
 *                   confidence: 0.85
 *                   createdAt: 2023-01-01T12:00:00.000Z
 *                   updatedAt: 2023-01-01T12:00:00.000Z
 *                 - id: 2
 *                   song_id: 2
 *                   user_id: 99
 *                   emotion: Sad
 *                   confidence: 0.92
 *                   createdAt: 2023-01-02T12:00:00.000Z
 *                   updatedAt: 2023-01-02T12:00:00.000Z
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
 *               error: Error fetching classifications
 */
router.get('/', validateToken, SongClassificationController.index);

/**
 * @swagger
 * /classifications/songs/{external_id}/users/{user_id}:
 *   post:
 *     summary: Classify a song with emotion
 *     operationId: classifySong
 *     tags: [Classifications]
 *     parameters:
 *       - in: path
 *         name: external_id
 *         required: true
 *         schema:
 *           type: string
 *         description: External song ID (e.g., YouTube video ID)
 *         example: dQw4w9WgXcQ
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "42"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emotion
 *             properties:
 *               emotion:
 *                 type: string
 *                 description: Emotion classification for the song
 *                 example: Happy
 *               confidence:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Confidence score for the classification (optional)
 *                 example: 0.85
 *           example:
 *             emotion: Happy
 *             confidence: 0.85
 *     responses:
 *       201:
 *         description: Classification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Classification created successfully
 *                 classification:
 *                   $ref: '#/components/schemas/Classification'
 *             example:
 *               message: Classification created successfully
 *               classification:
 *                 id: 1
 *                 song_id: 1
 *                 user_id: 42
 *                 emotion: Happy
 *                 confidence: 0.85
 *                 createdAt: 2023-01-01T12:00:00.000Z
 *                 updatedAt: 2023-01-01T12:00:00.000Z
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid emotion value
 *       404:
 *         description: Song or user not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       409:
 *         description: Classification already exists
 *         content:
 *           application/json:
 *             example:
 *               error: Classification already exists for this song and user
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error creating classification
 */
router.post(
  '/songs/:external_id/users/:user_id',
  songValidationRules.classification,
  validate,
  SongClassificationController.classify
);

module.exports = router;
