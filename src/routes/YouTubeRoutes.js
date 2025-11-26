const express = require('express');
const router = express.Router();

// Controller
const YouTubeController = require('../controllers/YouTubeController');

// YouTube Search Route
router.get('/search', YouTubeController.searchYouTube);

module.exports = router;
