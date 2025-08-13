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
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         is_blocked:
 *           type: boolean
 *           example: false
 *         is_verified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T12:00:00.000Z
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     operationId: signupUser
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password@123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User created successfully
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *                 role: user
 *                 is_verified: false
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Username already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error creating user
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
 *     operationId: loginUser
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: Login successful
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *                 role: user
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid email or password
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid credentials
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error during login
 */
router.post(
  '/login',
  userValidationRules.login,
  validate,
  UserController.index
);

/**
 * @swagger
 * /users/confirm/{token}:
 *   get:
 *     summary: Confirm user email with token
 *     operationId: confirmUserEmail
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email confirmation token
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email confirmed successfully
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error confirming email
 */
router.get('/confirm/:token', UserController.validate);

/**
 * @swagger
 * /users/newtoken:
 *   get:
 *     summary: Resend email confirmation token
 *     operationId: resendConfirmationToken
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: New token sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: New confirmation token sent
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               error: User already verified
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error sending new token
 */
router.get('/newtoken', UserController.resendEmail);

/**
 * @swagger
 * /users/reset/password:
 *   post:
 *     summary: Request password reset
 *     operationId: requestPasswordReset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset email sent
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error sending reset email
 */
router.post('/reset/password', UserController.resetPassword);

/**
 * @swagger
 * /users/reset/password/change:
 *   post:
 *     summary: Change password with reset token
 *     operationId: changePasswordWithToken
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: reset_token_here
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password changed successfully
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error changing password
 */
router.post('/reset/password/change', UserController.passwordChange);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get current user information
 *     operationId: getCurrentUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *                 role: user
 *                 is_blocked: false
 *                 is_verified: true
 *                 createdAt: 2023-01-01T12:00:00.000Z
 *                 updatedAt: 2023-01-02T12:00:00.000Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching user information
 */
router.get('/', validateToken, UserController.show);

/**
 * @swagger
 * /users/change/password:
 *   post:
 *     summary: Change user password
 *     operationId: changeUserPassword
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - password
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword123
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password changed successfully
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Current password is incorrect
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error changing password
 */

router.post(
  '/change/password',
  validateToken,
  userValidationRules.passwordChange,
  validate,
  UserController.changePassword
);

/**
 * @swagger
 * /users/change/username:
 *   post:
 *     summary: Change user username
 *     operationId: changeUserUsername
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: newUsername
 *     responses:
 *       200:
 *         description: Username changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Username changed successfully
 *               user:
 *                 id: 1
 *                 username: newusername
 *                 email: john@example.com
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Username already exists
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error changing username
 */
router.post('/change/username', validateToken, UserController.changeUsername);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (admin only)
 *     operationId: getAllUsers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               users:
 *                 - id: 1
 *                   username: johndoe
 *                   email: john@example.com
 *                   role: user
 *                   is_blocked: false
 *                   is_verified: true
 *                 - id: 2
 *                   username: admin
 *                   email: admin@example.com
 *                   role: admin
 *                   is_blocked: false
 *                   is_verified: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             example:
 *               error: Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching users
 */
router.get('/all', validateToken, requireAdmin, UserController.getUsers);

/**
 * @swagger
 * /users/search:
 *   post:
 *     summary: Search users by email or username (admin only)
 *     operationId: searchUsers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: john
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               users:
 *                 - id: 1
 *                   username: johndoe
 *                   email: john@example.com
 *                   role: user
 *                   is_blocked: false
 *                   is_verified: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             example:
 *               error: Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error searching users
 */
router.post(
  '/search',
  validateToken,
  requireAdmin,
  UserController.getUsersByEmailOrUsername
);

/**
 * @swagger
 * /users/blocked:
 *   get:
 *     summary: Get all blocked users (admin only)
 *     operationId: getBlockedUsers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               users:
 *                 - id: 3
 *                   username: blockeduser
 *                   email: blocked@example.com
 *                   role: user
 *                   is_blocked: true
 *                   is_verified: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             example:
 *               error: Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching blocked users
 */
router.get(
  '/blocked',
  validateToken,
  requireAdmin,
  UserController.getOnlyBlockedUsers
);

/**
 * @swagger
 * /users/isblocked:
 *   post:
 *     summary: Check if user is blocked
 *     operationId: checkUserBlocked
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: User block status
 *         content:
 *           application/json:
 *             example:
 *               isBlocked: User is not blocked
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid email format
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error checking user block status
 */
router.post('/isblocked', validate, UserController.isBlockedUser);

/**
 * @swagger
 * /users/block/{email}:
 *   post:
 *     summary: Block a user (admin only)
 *     operationId: blockUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User blocked successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             example:
 *               error: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error blocking user
 */
router.post(
  '/block/:email',
  validateToken,
  requireAdmin,
  UserController.blockUser
);

/**
 * @swagger
 * /users/unblock/{email}:
 *   post:
 *     summary: Unblock a user (admin only)
 *     operationId: unblockUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User unblocked successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             example:
 *               error: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error unblocking user
 */
router.post(
  '/unblock/:email',
  validateToken,
  requireAdmin,
  UserController.unblockUser
);

module.exports = router;
