const express = require('express');
const cors = require('cors');
const route = require('./routes/Router');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const requestIp = require('request-ip');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');

// Load environment variables
require('dotenv').config();

// Setup Socket.io
/*const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_SOCKET_URL || 'https://mermaid.dei.uc.pt',
  },
  withCredentials: true,
});*/

const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectedSong = {};

app.use(cors()); // CORS middleware
app.use(express.json()); // Body parsing middleware

io.on('connection', (socket) => {
  const { song_id } = socket.handshake.query;
  connectedSong[song_id] = socket.id;
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedSong = connectedSong;
  next();
});

app.use(requestIp.mw()); // Middleware to get the IP of the user
app.use('/', route); // Use routes with /api prefix
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

server.listen(8000, () => {
  console.log('[mermaid-api] server running on port 8000');
});

module.exports = { io };
