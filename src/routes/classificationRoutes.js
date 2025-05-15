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
 * /classifications:
 *   get:
 *     summary: Get all song classifications
 *     tags: [Classifications]
 *     responses:
 *       200:
 *         description: List of classifications
 */
router.get('/', validateToken, SongClassificationController.index);

/**
 * @swagger
 * /classifications/songs/{external_id}/users/{user_id}:
 *   post:
 *     summary: Classify a song
 *     tags: [Classifications]
 *     parameters:
 *       - in: path
 *         name: external_id
 *         required: true
 *         schema:
 *           type: string
 *         description: External song ID
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emotion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Classification created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/songs/:external_id/users/:user_id',
  songValidationRules.classification,
  validate,
  SongClassificationController.classify
);

module.exports = router;
