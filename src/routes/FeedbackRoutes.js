const express = require('express');
const router = express.Router();

// Controller
const FeedbackController = require('../controllers/FeedbackController');

// Feedback routes
router.post('/agree/disagree/:agreeordisagree/user/:user_id/song/:song_id', FeedbackController.index);
router.get('/agrees/:song_id', FeedbackController.getTotalAgrees);
router.get('/disagrees/:song_id', FeedbackController.getTotalDisagrees);
router.get('/opinion/:user_id/:song_id', FeedbackController.getUserOpinion);
router.delete('/:user_id/:song_id', FeedbackController.undoFeedback);

module.exports = router;
