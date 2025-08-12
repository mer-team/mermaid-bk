const express = require('express');

const UserController = require('../controllers/UserController');
const {
  validateToken,
  requireAdmin,
  userValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/signup',
  userValidationRules.signup,
  validate,
  UserController.store
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/login',
  userValidationRules.login,
  validate,
  UserController.index
);

router.get('/confirm/:token', UserController.validate);
router.get('/newtoken', UserController.resendEmail);
router.post('/reset/password', UserController.resetPassword);
router.post('/reset/password/change', UserController.passwordChange);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateToken, UserController.show);

router.post(
  '/change/password',
  validateToken,
  userValidationRules.passwordChange,
  validate,
  UserController.changePassword
);

router.post('/change/username', validateToken, UserController.changeUsername);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/all', validateToken, requireAdmin, UserController.getUsers);
router.post(
  '/search',
  validateToken,
  requireAdmin,
  UserController.getUsersByEmailOrUsername
);
router.get(
  '/blocked',
  validateToken,
  requireAdmin,
  UserController.getOnlyBlockedUsers
);
router.post('/isblocked', validate, UserController.isBlockedUser);

router.post(
  '/block/:email',
  validateToken,
  requireAdmin,
  UserController.blockUser
);
router.post(
  '/unblock/:email',
  validateToken,
  requireAdmin,
  UserController.unblockUser
);

module.exports = router;
