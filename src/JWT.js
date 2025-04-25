require('dotenv').config();
const { User } = require('../src/models/index');
const { verify } = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) return res.status(400).json('User not Authenticated!');

  try {
    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    const userData = await User.findOne({
      where: {
        email: decoded.email,
      },
    });

    if (!userData) {
      return res.status(403).json({ error: 'The user does not exist!' });
    }

    req.user = userData;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired!' });
    }

    return res.status(403).json({ error: 'Invalid token!' });
  }
};

module.exports = { validateToken };
