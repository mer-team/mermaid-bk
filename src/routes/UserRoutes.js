const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

const {
    userCreateValidation,
    loginValidation,
    passwordChangeValidation,
    usernameChangeValidation,
    validateRequest,
    validateId,
} = require('../middlewares/userValidations');

const { validateToken } = require('../middlewares/jwt');

// User routes
router.get('/', UserController.getUsers);
router.get('/:id', validateId(), validateRequest, UserController.show);
router.get('/:token', validateToken, UserController.show);
router.post('/signup', userCreateValidation(), validateRequest, UserController.register);
router.post('/login', loginValidation(), validateRequest, UserController.login);
router.get('/confirm/:token', UserController.validate);
router.get('/newtoken', UserController.resendEmail);
router.post('/bynameoremail', UserController.getUsersByEmailOrUsername);
router.get('/blocked', UserController.getOnlyBlockedUsers);
router.post('/blockuser/:email', UserController.blockUser);
router.post('/unblockuser/:email', UserController.unblockUser);
router.post('/change/password', passwordChangeValidation(), validateRequest, UserController.changePassword);
router.post('/change/username', usernameChangeValidation(), validateRequest, UserController.changeUsername);
router.post('/reset/password', UserController.resetPassword);
router.post('/change/reset/password', UserController.changePassword);

module.exports = router;
