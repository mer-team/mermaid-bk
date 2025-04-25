const http = require('http');
const socketIo = require('socket.io');
const { app, connectedSong } = require('./app');
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

// Handle socket.io connections
io.on('connection', (socket) => {
  const { song_id } = socket.handshake.query;
  connectedSong[song_id] = socket.id;
});

// Attach socket.io to the app
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`[mermaid-api] server running on port ${PORT}`);
});

module.exports = { server, io };
