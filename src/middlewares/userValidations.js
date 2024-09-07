const { body, validationResult } = require('express-validator');

// User creation validation
const userCreateValidation = () => {
  return [
    body("name")
      .isString()
      .withMessage("Name is required!")
      .isLength({ min: 3 })
      .withMessage("The name needs to have at least 3 characters minimum"),
    body("email")
      .isString()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Please insert a valid email!"),
    body("password")
      .isString()
      .withMessage("The password you entered does not meet the password requirements. The password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit or special character, and cannot contain a period or a newline. Please try again.")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
      .withMessage("Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one digit, and one special character."),
    body("confirmPassword")
      .isString()
      .withMessage("Password confirmation is required!")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("The passwords don't match");
        }
        return true;
      }),
  ];
};

// Login validation
const loginValidation = () => {
  return [
    body("email")
      .isString()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Please insert a valid email!"),
    body("password")
      .isString()
      .withMessage("Password is required!"),
  ];
};

// Password change validation
const passwordChangeValidation = () => {
  return [
    body("oldPassword")
      .isString()
      .withMessage("Old password is required!"),
    body("newPassword")
      .isString()
      .withMessage("New password is required!")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
      .withMessage("New password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one digit, and one special character."),
    body("confirmNewPassword")
      .isString()
      .withMessage("Password confirmation is required!")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("The new passwords don't match");
        }
        return true;
      }),
  ];
};

// Username change validation
const usernameChangeValidation = () => {
  return [
    body("newUsername")
      .isString()
      .withMessage("New username is required!")
      .isLength({ min: 3 })
      .withMessage("The username needs to have at least 3 characters minimum"),
  ];
};

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  userCreateValidation,
  loginValidation,
  passwordChangeValidation,
  usernameChangeValidation,
  validateRequest,
};
