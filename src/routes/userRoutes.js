const express = require('express');
const UserController = require('../controllers/UserController');
const { validateToken } = require('../JWT');

const router = express.Router();

// Public routes
router.post('/signup', UserController.store);
router.post('/login', UserController.index);
router.get('/confirm/:token', UserController.validate);
router.get('/newtoken', UserController.resendEmail);
router.post('/reset/password', UserController.resetPassw);
router.post('/reset/password/change', UserController.passwordChange);

// Protected routes - require authentication
router.get('/', validateToken, UserController.show);
router.post('/change/password', validateToken, UserController.changePassword);
router.post('/change/username', validateToken, UserController.changeUsername);

// Admin routes
router.get('/all', validateToken, UserController.getUsers);
router.post('/search', validateToken, UserController.getUsersByEmailOrUsername);
router.get('/blocked', validateToken, UserController.getOnlyBlockedUsers);
router.post('/block/:email', validateToken, UserController.blockUser);
router.post('/unblock/:email', validateToken, UserController.unblockUser);

module.exports = router;
