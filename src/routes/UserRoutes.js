const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

const {
    userCreateValidation,
    loginValidation,
    passwordChangeValidation,
    usernameChangeValidation,
} = require('../middlewares/userValidations');

const { validateToken } = require('../middlewares/jwt');

// User routes
router.get('/', validateToken, UserController.show);
router.post('/signup', userCreateValidation(), UserController.register);
router.post('/login', loginValidation(), UserController.login);
router.get('/confirm/:token', UserController.confirmUser);
router.get('/newtoken', UserController.resendEmail);
router.post('/bynameoremail', UserController.getUsersByEmailOrUsername);
router.get('/blocked', UserController.getOnlyBlockedUsers);
router.post('/blockuser/:email', UserController.blockUser);
router.post('/unblockuser/:email', UserController.unblockUser);
router.post('/change/password', passwordChangeValidation(), UserController.changePassword);
router.post('/change/username', usernameChangeValidation(), UserController.changeUsername);
router.post('/reset/password', UserController.resetPassword);
router.post('/change/password', UserController.changePassword);

module.exports = router;
