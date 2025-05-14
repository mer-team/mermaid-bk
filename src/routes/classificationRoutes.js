const express = require('express');

const SongClassificationController = require('../controllers/SongClassificationController');
const {
  validateToken,
  songValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

// Get all classifications - protected for admin only
router.get('/', validateToken, SongClassificationController.index);

// Process a new song classification with validation
router.post(
  '/songs/:external_id/users/:user_id',
  songValidationRules.classification,
  validate,
  SongClassificationController.classify,
);

module.exports = router;
