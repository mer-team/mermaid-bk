const express = require('express');

const FeedbackController = require('../controllers/FeedbackController');
const {
  validateToken,
  feedbackValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

// Submit feedback with validation
router.post(
  '/songs/:song_id/users/:user_id/:agreeordisagree',
  feedbackValidationRules.submit,
  validate,
  FeedbackController.index,
);

// Get feedback statistics
router.get('/songs/:song_id/agrees', FeedbackController.getTotalAgrees);
router.get('/songs/:song_id/disagrees', FeedbackController.getTotalDisagrees);
router.get('/users/:user_id/songs/:song_id', FeedbackController.getUserOpinion);

// User must be authenticated to delete their feedback
router.delete(
  '/users/:user_id/songs/:song_id',
  validateToken,
  FeedbackController.undoFeedback,
);

module.exports = router;
