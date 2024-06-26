require('dotenv').config();
const { User, Sequelize } = require('../models/index');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

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
        return res
          .status(400)
          .json(
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
        return res.status(400).json('This email or name is already in use');
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

          return res
            .status(201)
            .json({ message: 'Please check your email to confirm your account' });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (e) {
      console.log(e);
    }
  },

  //Login the user and return the jwt token
  async index(req, res) {
    try {
      const { email, passw } = req.body;
      //verify if the email exists on our database
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).json('User Not Founded');
      }

      if (!user.confirmed) {
        return res.status(400).json('Confirm your email');
      }

      //verify if the password equals to the one on the database
      if (await bcrypt.compare(passw, user.hash_passwd)) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
      } else {
        return res.status(400).json('Wrong Password');
      }
    } catch (e) {
      console.log(e);
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
        return res.status(401).json('Token has expired');
      }
      //Update the confirmed in the database
      await User.update({ confirmed: true }, { where: { email: email } });
      return res.status(200).json('Confirmed Email');
    } catch (e) {
      console.log(e);
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
        return res.status(201).json({ message: 'Please check your email to confirm your account' });
      } else {
        // Handle error sending email
        return res
          .status(500)
          .json({ message: 'Failed to send confirmation email. Please try again.' });
      }
    } catch (e) {
      console.log(e);
    }
  },

  async getUsers(req, res) {
    try {
      const users = await User.findAll();

      return res.status(200).json(users);
    } catch (e) {
      console.log(e);
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

        return res.status(200).json(users);
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

        return res.status(200).json(users);
      }
    } catch (e) {
      console.log(e);
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

      return res.status(200).json(users);
    } catch (e) {
      console.log(e);
    }
  },

  async blockUser(req, res) {
    const { email } = req.params;
    try {
      await User.update({ blocked_at: new Date() }, { where: { email: email } });
      return res.status(200).json('User Blocked with sucess');
    } catch (e) {
      console.log(e);
    }
  },

  async unblockUser(req, res) {
    const { email } = req.params;
    try {
      await User.update({ blocked_at: null }, { where: { email: email } });
      return res.status(200).json('User Unblocked with sucess');
    } catch (e) {
      console.log(e);
    }
  },

  async changePassword(req, res) {
    const { email, password, oldPassword } = req.body;
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
        return res
          .status(400)
          .json(
            'Error: The password you entered does not meet the password requirements. The password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit or special character, and cannot contain a period or a newline. Please try again.',
          );
      } else {
        //Create a hashed password
        const hash_passw = await bcrypt.hash(password, 10);
        //see if the hash pasword equals to the same in the database
        if (await bcrypt.compare(password, user.hash_passwd)) {
          return res
            .status(400)
            .json('The current password is equal to the one you are trying to change');
        }
        await User.update({ hash_passwd: hash_passw }, { where: { email: email } });
        return res.status(200).json('Password Changed with sucess');
      }
    } else {
      return res.status(400).json('The old password is wrong.');
    }
  },

  async changeUsername(req, res) {
    const { username, email, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    //verify if the password equals to the one on the database
    if (await bcrypt.compare(password, user.hash_passwd)) {
      //Check if the current name and email exists on the database
      const users = await User.findAll({
        where: {
          name: username,
        },
      });

      if (users.length > 0) {
        return res.status(400).json('This name is already in use');
      } else {
        await User.update({ name: username }, { where: { email: email } });
        return res.status(200).json('Username Updated');
      }
    } else {
      return res.status(400).json('Wrong Password');
    }
  },

  async resetPassw(req, res) {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
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
          return res.status(201).json({ message: 'Please check your email to reset the password' });
        } catch (error) {
          /* empty */
        }
      } else {
        return res.status(400).json('Please confirm your email first');
      }
    } else {
      return res.status(400).json('Invalid Email');
    }
  },

  async passwordChange(req, res) {
    const { email, password } = req.body;

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

    try {
      await User.update({ hash_passw: hash_passw }, { where: { email: email } });

      return res.status(200).json('Password changed');
    } catch (e) {
      /* empty */
    }
  },
};
