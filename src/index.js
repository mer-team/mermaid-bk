const express = require('express');
const cors = require('cors');
const router = require('./routes/Router');
const path = require('path');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const requestIp = require('request-ip');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const { startConsumer } = require('./Services/rabbitmqConsumer');

// Load environment variables
require('dotenv').config();

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_SOCKET_URL || 'https://mermaid.dei.uc.pt',
  },
  withCredentials: true,
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
app.use(cors()); // CORS middleware
app.use(express.json()); // Body parsing middleware

// Static file serving
// Use /mermaid-api path where Docker volumes are mounted
const uploadsPath = '/mermaid-api/src/Uploads';
app.use('/profilePictures', express.static(path.join(uploadsPath, 'ProfilePictures')));
app.use('/songLyrics', express.static(path.join(uploadsPath, 'SongLyrics')));
app.use('/songIntrumentals', express.static(path.join(uploadsPath, 'SongInstrumentals')));
app.use('/songVocals', express.static(path.join(uploadsPath, 'SongVocals')));
app.use('/songSegments', express.static(path.join(uploadsPath, 'SongSegments')));

app.use(router);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Start server
server.listen(8000, () => {
  console.log('[mermaid-api] server running on port 8000');

  // Initialize RabbitMQ consumers (one time only)
  console.log('[RabbitMQ] Starting consumers...');
  startConsumer('song_processing_log');
  startConsumer('song_processing_segments');
  startConsumer('song_processing_complete');
  startConsumer('pipeline_stage_update');
  startConsumer('pipeline_error');
  console.log('[RabbitMQ] All consumers initialized');
});

module.exports = { io };
