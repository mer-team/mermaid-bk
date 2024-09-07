const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/FeedbackController');

// Feedback routes
router.post('/feedback/agree/disagree/:agreeordisagree/user/:user_id/song/:song_id', FeedbackController.index);
router.get('/feedback/agrees/:song_id', FeedbackController.getTotalAgrees);
router.get('/feedback/disagrees/:song_id', FeedbackController.getTotalDisagrees);
router.get('/feedback/opinion/:user_id/:song_id', FeedbackController.getUserOpinion);
router.delete('/feedback/:user_id/:song_id', FeedbackController.undoFeedback);

module.exports = router;
