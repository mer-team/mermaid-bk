const express = require('express');
const FeedbackController = require('../controllers/FeedbackController');

const router = express.Router();

// Submit feedback (agree/disagree) for a song classification
router.post('/songs/:song_id/users/:user_id/:agreeordisagree', FeedbackController.index);

// Get feedback statistics
router.get('/songs/:song_id/agrees', FeedbackController.getTotalAgrees);
router.get('/songs/:song_id/disagrees', FeedbackController.getTotalDisagrees);
router.get('/users/:user_id/songs/:song_id', FeedbackController.getUserOpinion);
router.delete('/users/:user_id/songs/:song_id', FeedbackController.undoFeedback);

module.exports = router;
