const { User } = require('../models/Index');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 1025,  // Default port for MailCatcher is 1025
  secure: false, // MailCatcher does not use SSL/TLS by default
  auth: {
    user: process.env.SMTP_USER || 'docker',  // MailCatcher does not require authentication
    pass: process.env.SMTP_PASS || 'docker',
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true',
  },
});

const register = async (req, res) => {
  try {
    const { name, email, password, admin } = req.body;
    console.log(req.body); // For debugging purposes, logging the request body

    // Check if user already exists with the given email
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(422).json({ errors: ['Email already in use!'] });
    }

    // Generate JWT token for email confirmation
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new user
    await User.create({ email, hash_passwd: passwordHash, name, admin });

    // Prepare the email for sending
    const sendEmail = {
      from: 'noreply@mermaid.com',
      to: email,
      subject: 'Confirm your email',
      text: `Please click on the following link to confirm your email address: http://localhost:3000/confirm/${token}`,
    };

    // Send the confirmation email
    await transporter.sendMail(sendEmail);

    // Respond with success message
    return res.status(201).json({ message: 'Please check your email to confirm your account' });

  } catch (err) {
    console.error('Error during user registration:', err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};


// Confirm user email
const confirmUser = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, exp } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (Date.now() >= exp * 1000) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    const [affectedRows] = await User.update({ confirmed: true }, { where: { email } });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'Email confirmed successfully' });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User Not Found' });
    }

    if (!user.confirmed) {
      return res.status(400).json({ error: 'Please confirm your email address' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash_passwd);

    if (isPasswordValid) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token });
    } else {
      return res.status(400).json({ error: 'Incorrect Password' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get User
const show = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(req.user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Resend confirmation email
const resendEmail = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && accessToken.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const email = decoded.email;

    const newToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

    const sendEmail = {
      from: 'noreply@mermaid.com',
      to: email,
      subject: 'Confirm your email',
      text: `Please click on the following link to confirm your email address: http://localhost:3000/confirm/${newToken}`,
    };

    const info = await transporter.sendMail(sendEmail);

    if (info && info.accepted.length > 0) {
      return res.status(200).json({ message: 'Please check your email to confirm your account' });
    } else {
      return res.status(500).json({ message: 'Failed to send confirmation email. Please try again.' });
    }
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};

// Get users by email or username
const getUsersByEmailOrUsername = async (req, res) => {
  const { name, email, blocked } = req.body;

  try {
    const whereClause = {
      [Op.or]: [
        {
          email: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('email')),
            'LIKE',
            `%${email || ''}%`
          ),
        },
        {
          name: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('name')),
            'LIKE',
            `%${name || ''}%`
          ),
        },
      ],
    };

    if (blocked !== undefined) {
      whereClause.blocked_at = blocked ? { [Op.ne]: null } : null;
    }

    const users = await User.findAll({ where: whereClause });

    return res.status(200).json(users);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};

// Block user
const blockUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ blocked_at: new Date() }, { where: { email } });

    return res.status(200).json({ message: 'User blocked successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while blocking the user' });
  }
};

//Get blocked user by email
const getBlockedUser = async (req, res) => {
  const { email } = req.body; // Assuming you're sending the email in the body

  try {
    const user = await User.findOne({
      where: {
        email,
        blocked_at: {
          [Op.ne]: null
        },
      },
    });

    // Check if user is found and blocked
    if (user) {
      return res.status(200).json({ blocked: true });
    } else {
      return res.status(200).json({ blocked: false });
    }
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return res.status(500).json({ message: 'An error occurred while fetching blocked users.' });
  }
};


// Get only blocked users
const getOnlyBlockedUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        blocked_at: {
          [Op.ne]: null,
        },
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return res.status(500).json({ message: 'An error occurred while fetching blocked users.' });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  const { email } = req.params;

  try {
    await User.update({ blocked_at: null }, { where: { email } });

    return res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return res.status(500).json({ message: 'An error occurred while unblocking the user.' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { email, password, oldPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.hash_passwd);

    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'The old password is incorrect.' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.update({ hash_passwd: hashedPassword }, { where: { email } });

    return res.status(200).json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'An error occurred while changing the password.' });
  }
};

// Change username
const changeUsername = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash_passwd);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    await User.update({ name: username }, { where: { email } });

    return res.status(200).json({ message: 'Username updated successfully.' });
  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).json({ message: 'An error occurred while updating the username.' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      if (user.confirmed) {
        try {
          const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

          // Send the reset password email
          const sendEmail = {
            from: 'noreply@mermaid.com',
            to: email,
            subject: 'Reset Password',
            text: `Please click on the following link to reset your password: http://localhost:3000/resetpassword/${token}`,
          };

          await transporter.sendMail(sendEmail);

          return res.status(201).json({ message: 'Please check your email to reset the password' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Failed to send reset password email. Please try again.' });
        }
      } else {
        return res.status(400).json({ message: 'Please confirm your email first' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid Email' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while resetting the password' });
  }
};

// Validate user
const validate = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify and decode the token
    const { email } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Token is valid; respond with email
    return res.status(200).json({ message: 'Token is valid', email });
  } catch (err) {
    // Handle expired token specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token has expired' });
    }

    // Handle other verification errors (e.g., invalid token)
    return res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = {
  register,
  confirmUser,
  login,
  show,
  resendEmail,
  getUsers,
  getUsersByEmailOrUsername,
  blockUser,
  getBlockedUser,
  getOnlyBlockedUsers,
  unblockUser,
  changePassword,
  changeUsername,
  resetPassword,
  validate,
};
