const express = require('express');
const router = express.Router();

//Controller
const UserController = require('../controllers/UserController');

//Middlewares
const validate = require("../middlewares/handleValidation");
const {
    userCreateValidation,
    passwordChangeValidation,
    usernameChangeValidation,
} = require('../middlewares/userValidations');

const { validateToken } = require('../middlewares/jwt');

// User routes
router.get('/', validateToken, UserController.show);
router.post('/signup', userCreateValidation(), validate, UserController.register);
router.post('/login', UserController.login);
router.get('/confirm/:token', UserController.confirmUser);
router.get('/newtoken', UserController.resendEmail);
router.post('/bynameoremail', UserController.getUsersByEmailOrUsername);
router.get('/blocked', UserController.getOnlyBlockedUsers);
router.post('/blockuser/:email', UserController.blockUser);
router.post('/unblockuser/:email', UserController.unblockUser);
router.post('/change/password', passwordChangeValidation(), validate, UserController.changePassword);
router.post('/change/username', usernameChangeValidation(), validate, UserController.changeUsername);
router.post('/reset/password', UserController.resetPassword);
router.post('/change/password', UserController.changePassword);

module.exports = router;
