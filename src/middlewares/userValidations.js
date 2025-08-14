'use strict';

const { body } = require('express-validator');

// User creation validation
const userCreateValidation = () => {
  return [
    body("name")
      .isLength({ min: 3 })
      .withMessage("The name needs to have at least 3 characters minimum"),
    body("email")
      .isEmail()
      .withMessage("Please insert a valid email!"),
    body("password")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
      .withMessage("Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one digit, and one special character."),
  ];
};

// Password change validation
const passwordChangeValidation = () => {
  return [
    body("newPassword")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
      .withMessage("New password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one digit, and one special character."),
  ];
};

// Username change validation
const usernameChangeValidation = () => {
  return [
    body("newUsername")
      .isLength({ min: 3 })
      .withMessage("The username needs to have at least 3 characters minimum"),
  ];
};

module.exports = {
  userCreateValidation,
  passwordChangeValidation,
  usernameChangeValidation,
};
