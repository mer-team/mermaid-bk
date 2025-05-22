// Mock implementation for the routes module
const express = require('express');
const router = express.Router();

// Simple health endpoint for testing
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test route for health checks
router.get('/up', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
