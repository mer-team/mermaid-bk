const { User } = require('../models/User');
const { verify } = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) return res.status(401).json({ error: 'Authentication token is missing!' });

  try {
    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const userData = await User.findOne({
      where: {
        email: decoded.email
      }
    });

    if (!userData) {
      return res.status(403).json({ error: 'User does not exist!' });
    }

    req.user = userData;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired!' });
    }
    return res.status(403).json({ error: 'Invalid token!' });
  }
};

module.exports = { validateToken };
