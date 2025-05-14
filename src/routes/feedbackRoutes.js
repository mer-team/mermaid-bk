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
 * /feedbacks/songs/{song_id}/users/{user_id}/{agreeordisagree}:
 *   post:
 *     summary: Submit feedback on a song classification
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: agreeordisagree
 *         required: true
 *         schema:
 *           type: string
 *           enum: [agree, disagree]
 *         description: Feedback type
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/songs/:song_id/users/:user_id/:agreeordisagree',
  feedbackValidationRules.submit,
  validate,
  FeedbackController.index
);

/**
 * @swagger
 * /feedbacks/songs/{song_id}/agrees:
 *   get:
 *     summary: Get total agrees for a song
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Total agrees count
 *       404:
 *         description: Song not found
 */
router.get('/songs/:song_id/agrees', FeedbackController.getTotalAgrees);

/**
 * @swagger
 * /feedbacks/songs/{song_id}/disagrees:
 *   get:
 *     summary: Get total disagrees for a song
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Total disagrees count
 *       404:
 *         description: Song not found
 */
router.get('/songs/:song_id/disagrees', FeedbackController.getTotalDisagrees);

/**
 * @swagger
 * /feedbacks/users/{user_id}/songs/{song_id}:
 *   get:
 *     summary: Get user's feedback on a song
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: User's feedback
 */
router.get('/users/:user_id/songs/:song_id', FeedbackController.getUserOpinion);

/**
 * @swagger
 * /feedbacks/users/{user_id}/songs/{song_id}:
 *   delete:
 *     summary: Delete user's feedback on a song
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: song_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback deleted
 */
router.delete(
  '/users/:user_id/songs/:song_id',
  validateToken,
  FeedbackController.undoFeedback
);

module.exports = router;
