const express = require('express');

const FeedbackController = require('../controllers/FeedbackController');
const {
  validateToken,
  feedbackValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
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
 *           example: 1
 *         feedback_type:
 *           type: string
 *           enum: [agree, disagree]
 *           example: agree
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
 * /feedback/songs/{song_id}/users/{user_id}/{agreeordisagree}:
 *   post:
 *     summary: Submit feedback on a song classification
 *     operationId: submitSongFeedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *         example: "1"
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "42"
 *       - in: path
 *         name: agreeordisagree
 *         required: true
 *         schema:
 *           type: string
 *           enum: [agree, disagree]
 *         description: Feedback type (agree or disagree with classification)
 *         example: agree
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback submitted successfully
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *             example:
 *               message: Feedback submitted successfully
 *               feedback:
 *                 id: 1
 *                 song_id: 1
 *                 user_id: 42
 *                 feedback_type: agree
 *                 createdAt: 2023-01-01T12:00:00.000Z
 *                 updatedAt: 2023-01-01T12:00:00.000Z
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid feedback type
 *       404:
 *         description: Song or user not found
 *         content:
 *           application/json:
 *             example:
 *               error: Song not found
 *       409:
 *         description: Feedback already exists
 *         content:
 *           application/json:
 *             example:
 *               error: Feedback already submitted for this song
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error submitting feedback
 */
router.post(
  '/songs/:song_id/users/:user_id/:agreeordisagree',
  feedbackValidationRules.submit,
  validate,
  FeedbackController.index
);

/**
 * @swagger
 * /feedback/songs/{song_id}/agrees:
 *   get:
 *     summary: Get total agrees for a song
 *     operationId: getSongAgrees
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Total agrees count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAgrees:
 *                   type: integer
 *                   example: 15
 *             example:
 *               totalAgrees: 15
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
 *               error: Error fetching agrees count
 */
router.get('/songs/:song_id/agrees', FeedbackController.getTotalAgrees);

/**
 * @swagger
 * /feedback/songs/{song_id}/disagrees:
 *   get:
 *     summary: Get total disagrees for a song
 *     operationId: getSongDisagrees
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Total disagrees count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDisagrees:
 *                   type: integer
 *                   example: 5
 *             example:
 *               totalDisagrees: 5
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
 *               error: Error fetching disagrees count
 */
router.get('/songs/:song_id/disagrees', FeedbackController.getTotalDisagrees);

/**
 * @swagger
 * /feedback/users/{user_id}/songs/{song_id}:
 *   get:
 *     summary: Get user's feedback on a song
 *     operationId: getUserFeedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "42"
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: User's feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *             example:
 *               feedback:
 *                 id: 1
 *                 song_id: 1
 *                 user_id: 42
 *                 feedback_type: agree
 *                 createdAt: 2023-01-01T12:00:00.000Z
 *                 updatedAt: 2023-01-01T12:00:00.000Z
 *       404:
 *         description: Feedback, song, or user not found
 *         content:
 *           application/json:
 *             example:
 *               error: Feedback not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching user feedback
 */
router.get('/users/:user_id/songs/:song_id', FeedbackController.getUserOpinion);

/**
 * @swagger
 * /feedback/users/{user_id}/songs/{song_id}:
 *   delete:
 *     summary: Delete user's feedback on a song
 *     operationId: deleteFeedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "42"
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Feedback deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       404:
 *         description: Feedback not found
 *         content:
 *           application/json:
 *             example:
 *               error: Feedback not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error deleting feedback
 */
router.delete(
  '/users/:user_id/songs/:song_id',
  validateToken,
  FeedbackController.undoFeedback
);

module.exports = router;
