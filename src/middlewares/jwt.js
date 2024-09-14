require('dotenv').config();

const { User } = require('../models/Index');
const jwt = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (accessToken == null) {
    return res.status(401).json({ error: 'Authentication token is missing!' });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Find the user in the database using the decoded email
    const userData = await User.findOne({ where: { email: decoded.email } });

    // Check if the user exists
    if (!userData) {
      return res.status(404).json({ error: 'User does not exist!' });
    }

    // Attach user data to the request object
    req.user = userData;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle token expiration
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired!' });
    }

    // Handle invalid token errors
    return res.status(403).json({ error: 'Invalid token!' });
  }
};

module.exports = { validateToken };
