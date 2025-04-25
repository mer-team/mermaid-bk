const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const route = require('./routes');
require('dotenv').config(); // Load environment variables

const app = express();
const connectedSong = {};

// Middleware
app.use(cors());
app.use(requestIp.mw()); // Middleware to get the IP of the user
app.use(express.json());

// Attach socket.io and connectedSong to the request object
app.use((req, res, next) => {
  req.connectedSong = connectedSong;
  return next();
});

// Routes
app.use(route);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

module.exports = { app, connectedSong };
