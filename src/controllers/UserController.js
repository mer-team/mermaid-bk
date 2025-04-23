require('dotenv').config();
const { User, Sequelize } = require('../models/index');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const formatter = require('../utils/responseFormatter');

function validatePassw(passwd) {
  const regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  return regex.test(passwd);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true', // Convert string to boolean
  },
});

module.exports = {
  //Register the user
  async store(req, res) {
    try {
      //getting the name , email and password
      const { name, email, passw, admin } = req.body;

      //Check if it is a valid password the password
      if (!validatePassw(passw)) {
        return formatter.error(
          res,
          'Error: The password you entered does not meet the password requirements. The password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit or special character, and cannot contain a period or a newline. Please try again.',
        );
      }
      //Check if the current name and email exists on the database
      const users = await User.findAll({
        where: {
          [Op.or]: [{ email: email }, { name: name }],
        },
      });
      if (users.length > 0) {
        return formatter.error(res, 'This email or name is already in use');
      }
      //After all the verification we can create the user

      //Create a hashed password
      const hash_passw = await bcrypt.hash(passw, 10);

      // Generate a token secret key
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

      User.create({
        email: email,
        hash_passwd: hash_passw,
        name: name,
        admin: admin,
      })
        .then(async (user) => {
          //Send the confirmation email
          const sendEmail = {
            from: 'noreply@mermaid.com',
            to: email,
            subject: 'Confirm your email',
            text: `Please click on the following link to confirm your email address: http://localhost:3000/confirm/${token}`,
          };
          const info = await transporter.sendMail(sendEmail);

          return formatter.success(
            res,
            { message: 'Please check your email to confirm your account' },
            201,
          );
        })
        .catch((err) => {
          console.log(err);
          return formatter.error(res, 'Error creating user', 500);
        });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  //Login the user and return the jwt token
  async index(req, res) {
    try {
      const { email, passw } = req.body;
      //verify if the email exists on our database
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return formatter.error(res, 'User Not Found', 404);
      }

      if (!user.confirmed) {
        return formatter.error(res, 'Please confirm your email', 403);
      }

      //verify if the password equals to the one on the database
      if (await bcrypt.compare(passw, user.hash_passwd)) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        return formatter.success(res, { token });
      } else {
        return formatter.error(res, 'Invalid credentials');
      }
    } catch (e) {
      console.error(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  //get user data by the token
  async show(req, res) {
    return res.json(req.user);
  },

  //Confirm the user
  async validate(req, res) {
    const { token } = req.params;
    try {
      // Verify the confirmation token
      const { email, exp } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(exp);
      if (Date.now() >= exp * 1000) {
        // The token has expired
        return formatter.error(res, 'Token has expired', 401);
      }
      //Update the confirmed in the database
      await User.update({ confirmed: true }, { where: { email: email } });
      return formatter.success(res, { message: 'Confirmed Email' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Invalid token', 400);
    }
  },

  //If the token sended to the email has expired then the user needs to ask for another token by asking for another email
  async resendEmail(req, res) {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    try {
      const decoded = jwt.decode(accessToken);
      const email = decoded.email;
      // Generate a token secret key
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

      //Send the confirmation email
      const sendEmail = {
        from: 'noreply@mermaid.com',
        to: email,
        subject: 'Confirm your email',
        text: `Please click on the following link to confirm your email address: http://localhost:3000/confirm/${token}`,
      };

      const info = await transporter.sendMail(sendEmail);

      if (info && info.accepted.length > 0) {
        return formatter.success(
          res,
          { message: 'Please check your email to confirm your account' },
          201,
        );
      } else {
        return formatter.error(res, 'Failed to send confirmation email. Please try again.', 500);
      }
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  async getUsers(req, res) {
    try {
      const users = await User.findAll();

      return formatter.success(res, users);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching users', 500);
    }
  },

  async getUsersByEmailOrUsername(req, res) {
    const { name, email, blocked } = req.body;
    console.log(req.body);
    try {
      if (blocked) {
        const users = await User.findAll({
          where: {
            [Op.or]: [
              {
                email: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  'LIKE',
                  `%${email}%`,
                ),
              },
              {
                name: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('name')),
                  'LIKE',
                  `%${name}%`,
                ),
              },
            ],
            blocked_at: {
              [Op.ne]: null,
            },
          },
        });

        return formatter.success(res, users);
      } else {
        const users = await User.findAll({
          where: {
            [Op.or]: [
              {
                email: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  'LIKE',
                  `%${email}%`,
                ),
              },
              {
                name: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('name')),
                  'LIKE',
                  `%${name}%`,
                ),
              },
            ],
          },
        });

        return formatter.success(res, users);
      }
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error searching users', 500);
    }
  },

  async getOnlyBlockedUsers(req, res) {
    try {
      const users = await User.findAll({
        where: {
          blocked_at: {
            [Op.ne]: null,
          },
        },
      });

      return formatter.success(res, users);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching blocked users', 500);
    }
  },

  async blockUser(req, res) {
    const { email } = req.params;
    try {
      await User.update({ blocked_at: new Date() }, { where: { email: email } });
      return formatter.success(res, { message: 'User Blocked with success' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error blocking user', 500);
    }
  },

  async unblockUser(req, res) {
    const { email } = req.params;
    try {
      await User.update({ blocked_at: null }, { where: { email: email } });
      return formatter.success(res, { message: 'User Unblocked with success' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error unblocking user', 500);
    }
  },

  async changePassword(req, res) {
    const { email, password, oldPassword } = req.body;
    try {
      //verify if the email exists on our database
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      //See if the old Password equal to the one in the database
      if (await bcrypt.compare(oldPassword, user.hash_passwd)) {
        //verify if the password is valid
        //Check if it is a valid password the password
        if (!validatePassw(password)) {
          return formatter.error(
            res,
            'Error: The password you entered does not meet the password requirements. The password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit or special character, and cannot contain a period or a newline. Please try again.'
          );
        } else {
          //Create a hashed password
          const hash_passw = await bcrypt.hash(password, 10);
          //see if the hash pasword equals to the same in the database
          if (await bcrypt.compare(password, user.hash_passwd)) {
            return formatter.error(
              res,
              'The current password is equal to the one you are trying to change'
            );
          }
          await User.update({ hash_passwd: hash_passw }, { where: { email: email } });
          return formatter.success(res, { message: 'Password Changed with success' });
        }
      } else {
        return formatter.error(res, 'The old password is wrong.');
      }
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  async changeUsername(req, res) {
    const { username, email, password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return formatter.error(res, 'User not found');
      }

      //verify if the password equals to the one on the database
      if (await bcrypt.compare(password, user.hash_passwd)) {
        //Check if the current name and email exists on the database
        const users = await User.findAll({
          where: {
            name: username,
          },
        });

        if (users.length > 0) {
          return formatter.error(res, 'This name is already in use');
        } else {
          await User.update({ name: username }, { where: { email: email } });
          return formatter.success(res, { message: 'Username Updated' });
        }
      } else {
        return formatter.error(res, 'Wrong Password');
      }
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  async resetPassw(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return formatter.error(res, 'Invalid Email');
      }

      if (user.confirmed) {
        try {
          const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

          //Send the confirmation email
          const sendEmail = {
            from: 'noreply@mermaid.com',
            to: email,
            subject: 'Reset Password',
            text: `Please click on the following link to reset your password address: http://localhost:3000/resetpassword/${token}`,
          };

          const info = await transporter.sendMail(sendEmail);
          return formatter.success(
            res,
            { message: 'Please check your email to reset the password' },
            201,
          );
        } catch (error) {
          return formatter.error(res, 'Error sending email', 500);
        }
      } else {
        return formatter.error(res, 'Please confirm your email first');
      }
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Server error', 500);
    }
  },

  async passwordChange(req, res) {
    const { email, password } = req.body;
    try {
      //Check if it is a valid password the password
      if (!validatePassw(password)) {
        return res
          .status(400)
          .json(
            'Error: The password you entered does not meet the password requirements. The password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit or special character, and cannot contain a period or a newline. Please try again.',
          );
      }

      //Create a hashed password
      const hash_passw = await bcrypt.hash(password, 10);

      await User.update({ hash_passw: hash_passw }, { where: { email: email } });
      return formatter.success(res, { message: 'Password changed' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error changing password', 500);
    }
  },
};
