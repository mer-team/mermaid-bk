// This is a mock file for app.test.js
const express = require('express');
const router = express.Router();
const indexRoutes = require('./routes/index');

// Forward all routes to index routes
router.use('/', indexRoutes);

module.exports = router;
