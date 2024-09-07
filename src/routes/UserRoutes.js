const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const {
    userCreateValidation,
    loginValidation,
    passwordChangeValidation,
    usernameChangeValidation,
    validateRequest,
} = require('../middlewares/userValidations');

const { validateToken } = require('../middlewares/jwt');

// User routes
router.post('/signup', userCreateValidation(), validateRequest, UserController.register);
router.post('/login', loginValidation(), validateRequest, UserController.login);
router.get('/confirm/:token', UserController.validate);
router.get('/user', validateToken, UserController.show);
router.get('/user/newtoken', UserController.resendEmail);
router.post('/user/bynameoremail', UserController.getUsersByEmailOrUsername);
router.get('/user/blocked', UserController.getOnlyBlockedUsers);
router.post('/user/blockuser/:email', UserController.blockUser);
router.post('/user/unblockuser/:email', UserController.unblockUser);
router.get('/user/getall', UserController.getUsers);
router.post('/user/change/password', passwordChangeValidation(), validateRequest, UserController.changePassword);
router.post('/user/change/username', usernameChangeValidation(), validateRequest, UserController.changeUsername);
router.post('/user/reset/password', UserController.resetPassword);
router.post('/user/change/reset/password', UserController.changePassword);

module.exports = router;
