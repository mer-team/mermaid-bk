const http = require('http');

const socketIo = require('socket.io');

const app = require('./app');
const winston = require('./utils/logger'); // Custom logger
require('dotenv').config(); // Load environment variables

// Create HTTP server
const server = http.createServer(app);

// Setup socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_SOCKET_URL || 'https://mermaid.dei.uc.pt',
  },
  withCredentials: true,
});

// WebSocket connection logic
const connectedSong = {}; // Shared object for WebSocket connections
io.on('connection', (socket) => {
  const { song_id } = socket.handshake.query;
  connectedSong[song_id] = socket.id;
  winston.info(
    `WebSocket connected: song_id=${song_id}, socket_id=${socket.id}`,
  );

  socket.on('disconnect', () => {
    delete connectedSong[song_id];
    winston.info(`WebSocket disconnected: song_id=${song_id}`);
  });
});

// Attach socket.io and connectedSong to the app
app.use((req, res, next) => {
  req.io = io;
  req.connectedSong = connectedSong;
  next();
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  winston.info(`[mermaid-api] Server running on http://localhost:${PORT}`);
});
