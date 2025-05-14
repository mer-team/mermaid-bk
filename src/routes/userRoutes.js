const express = require('express');

const UserController = require('../controllers/UserController');
const {
  validateToken,
  requireAdmin,
  userValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

// Public routes
router.post(
  '/signup',
  userValidationRules.signup,
  validate,
  UserController.store,
);

router.post(
  '/login',
  userValidationRules.login,
  validate,
  UserController.index,
);

router.get('/confirm/:token', UserController.validate);
router.get('/newtoken', UserController.resendEmail);
router.post('/reset/password', UserController.resetPassw);
router.post('/reset/password/change', UserController.passwordChange);

// Protected routes - require authentication
router.get('/', validateToken, UserController.show);

router.post(
  '/change/password',
  validateToken,
  userValidationRules.passwordChange,
  validate,
  UserController.changePassword,
);

router.post('/change/username', validateToken, UserController.changeUsername);

// Admin routes - require admin role
router.get('/all', validateToken, requireAdmin, UserController.getUsers);
router.post(
  '/search',
  validateToken,
  requireAdmin,
  UserController.getUsersByEmailOrUsername,
);
router.get(
  '/blocked',
  validateToken,
  requireAdmin,
  UserController.getOnlyBlockedUsers,
);
router.post(
  '/block/:email',
  validateToken,
  requireAdmin,
  UserController.blockUser,
);
router.post(
  '/unblock/:email',
  validateToken,
  requireAdmin,
  UserController.unblockUser,
);

module.exports = router;
