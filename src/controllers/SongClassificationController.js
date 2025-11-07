require('dotenv').config();

const { Song_Classification, Log, Song, Song_Segments, Source } = require('../models/Index');
const axios = require('axios');
const async = require('async');
const search = require('youtube-search');
const path = require('path');

// RabbitMQ
const { sendMessage } = require('../Services/rabbitmqService');
const { startConsumer } = require('../Services/rabbitmqConsumer');

const API_KEY = process.env.YOUTUBE_API_KEY;

var request;

const convertIso8601DurationToSeconds = (duration) => {
  const regex = /PT(\d+H)?(\d+M)?(\d+S)?/; // Matches the ISO 8601 duration format
  const matches = duration.match(regex);

  const hours = matches[1] ? parseInt(matches[1]) : 0;
  const minutes = matches[2] ? parseInt(matches[2]) : 0;
  const seconds = matches[3] ? parseInt(matches[3]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
};

const saveTheSong = async (songId, userId, ip) => {
  return new Promise((resolve, reject) => {
    const opts = {
      key: API_KEY,
    };

    // YouTube search function (still callback-based)
    search(`https://www.youtube.com/watch?v=${songId}`, opts, async (err, results) => {
      if (err) {
        console.error(err);
        return reject(err); // Reject the promise on error
      }

      try {
        const videoId = results[0].id;

        // Fetch video details to get duration
        const videoDetailsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos`,
          {
            params: {
              part: 'contentDetails',
              id: videoId,
              key: API_KEY,
            },
          },
        );

        const duration = videoDetailsResponse.data.items[0].contentDetails.duration; // ISO 8601 format
        const durationInSeconds = convertIso8601DurationToSeconds(duration);

        // Save the song to the database
        await Song.create({
          external_id: videoId,
          link: results[0].link,
          title: results[0].title,
          artist: results[0].channelTitle,
          duration: durationInSeconds,
          year: new Date(results[0].publishedAt).getFullYear(),
          date: new Date(results[0].publishedAt),
          genre: 'Salsa, Kuduro, Romance', // Default value
          description: results[0].description,
          thumbnailHQ: results[0].thumbnails.high.url,
          thumbnailMQ: results[0].thumbnails.medium.url,
          hits: 0,
          waveform: 'dQw4w9WgXcQ.png',
          status: 'queued',
          added_by_ip: ip,
          added_by_user: userId,
          createdAt: new Date(),
          general_classification: '',
        });

        console.log('Song saved with duration:', durationInSeconds);
        resolve(); // Resolve the promise when the song is successfully saved
      } catch (e) {
        console.error('Error saving song:', e);
        reject(e); // Reject the promise if something goes wrong
      }
    });
  });
};

const updateStateSong = async (status, songId) => {
  try {
    await Song.update({ status }, { where: { external_id: songId } });
  } catch (e) {
    console.error(e);
  }
};

// Polling function to check for the log entry
const getLogs = async (req, res) => {
  const { song_id } = req.params;

  try {
    const logs = await Log.findAll({
      where: { song_id },
    });

    return res.status(200).json(logs);
  } catch {
    return res.status(400).json('No logs found!');
  }
};

// List of classification of the songs
const classificationQueue = async.queue(async (song_externalID) => {
  const songSocket = request.connectedSong[song_externalID];

  // search for the id of the song we just started to classify
  let songId = await Song.findOne({
    where: { external_id: song_externalID },
  });

  try {
    await updateStateSong('processing', song_externalID);

    // Start consumers for receiving updates from microservices
    startConsumer('song_processing_log');
    startConsumer('song_processing_segments');
    startConsumer('song_processing_completed');

    // Send only the YouTube URL to the manager-requests queue
    // The pipeline manager will orchestrate all microservices
    const managerQueue = 'manager-requests';
    const queueMessage = JSON.stringify({
      url: songId.link,
      song_id: songId.id,
      external_id: songId.external_id,
      title: songId.title,
    });

    console.log(`[API] Sending song to pipeline manager: ${songId.title}`);
    sendMessage(managerQueue, queueMessage);

    // Emit initial progress
    if (songSocket) {
      request.io.emit('progress', {
        progress: 5,
        song_id: song_externalID,
        state: 'Sent to processing pipeline',
      });
    }

    // The rest of the process will be handled by:
    // 1. Pipeline Manager → orchestrates download, segmentation, separation, transcription
    // 2. Microservices → send logs to 'song_processing_log'
    // 3. Microservices → send segments to 'song_processing_segments'
    // 4. Pipeline Manager → sends final result to 'song_processing_completed'
    // 5. rabbitmqConsumer.js → receives messages and calls internal API endpoints
  } catch (error) {
    await updateStateSong('error', song_externalID);
    console.error('Error starting classification:', error);

    if (songSocket) {
      request.io.emit('classification-error', {
        songId: song_externalID,
        error: error.message,
      });
    }
  }
}, 1);

const startClassification = async (song, user, ip) => {
  await saveTheSong(song, user, ip);

  classificationQueue.push(song, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('The song was classified');
    }
  });
};

const isAlreadyOnTheDatabase = async (song_id) => {
  return await Song.findOne({ where: { external_id: song_id } });
};

const howManySongsBasedOnUserId = async (id) => {
  const songs = await Song.findAll({
    where: {
      added_by_user: id,
      status: 'processed',
    },
  });
  return songs.length;
};

const howManySongsBasedOnUserIp = async (ip) => {
  const songs = await Song.findAll({
    where: {
      added_by_ip: ip,
      status: 'processed',
    },
  });

  return songs.length;
};

const index = async (req, res) => {
  try {
    const { id } = req.headers;
    const classifications = await Song_Classification.findAll({ where: { song_id: id } });
    return res.status(200).json(classifications);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getSegments = async (req, res) => {
  try {
    const { song_id } = req.params;

    const segments = await Song_Segments.findAll({ where: { song_id } });

    return res.status(200).json(segments);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getVoice = async (req, res) => {
  const { song_id } = req.params; // Extract email from request parameters

  try {
    const source = await Source.findOne({ where: { song_id } });

    const songVocalsUrl = `${req.protocol}://${req.get('host')}/songVocals/${path.basename(source.voice)}`;

    return res.status(200).json(songVocalsUrl);
  } catch (e) {
    console.error(e);
    return res.status(500).json('An error occurred while fetching the voice.');
  }
};

const getLyrics = async (req, res) => {
  const { song_id } = req.params; // Extract email from request parameters

  try {
    const source = await Source.findOne({ where: { song_id } });

    // Build the URL for the profile picture
    const songLyricsUrl = `${req.protocol}://${req.get('host')}/songLyrics/${path.basename(source.lyrics)}`;

    return res.status(200).json(songLyricsUrl);
  } catch (e) {
    console.error(e);
    return res.status(500).json('An error occurred while fetching the lyrics.');
  }
};

const getInstrumental = async (req, res) => {
  const { song_id } = req.params; // Extract email from request parameters

  try {
    const source = await Source.findOne({ where: { song_id } });

    // Build the URL for the profile picture
    const songInstrumentalUrl = `${req.protocol}://${req.get('host')}/songIntrumentals/${path.basename(source.instrumental)}`;

    return res.status(200).json(songInstrumentalUrl);
  } catch (e) {
    console.error(e);
    return res.status(500).json('An error occurred while fetching the instrumental.');
  }
};

const canClassify = async (userId, ip) => {
  // Retrieve the last classification time based on user or IP
  let song;

  if (userId == null) {
    song = await Song.findOne({
      where: {
        added_by_ip: ip,
      },
      order: [['createdAt', 'DESC']],
    });
  } else if (ip == null) {
    song = await Song.findOne({
      where: {
        added_by_user: userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  if (song && song.createdAt) {
    const now = new Date();
    const hoursSinceClassification = (now - new Date(song.createdAt)) / (1000 * 60 * 60); // Convert milliseconds to hours
    return hoursSinceClassification >= 24; // Return true if 24 hours have passed
  }
  return true; // Allow classification if no previous song found
};

const classify = async (req, res) => {
  try {
    const { external_id, user_id } = req.params;
    let ip = req.clientIp; // IP for guests

    request = req;

    // Check if the song is already in the queue
    if (await isAlreadyOnTheDatabase(external_id)) {
      return res.status(400).json('This song is already in the queue for classification.');
    }

    let limit;

    // If user is logged in (user_id is not 'null'), use user ID for classification limit
    if (user_id !== 'null') {
      limit = await howManySongsBasedOnUserId(user_id); // Get classification count by user ID

      if (limit % 5 === 0 && limit > 0) {
        if (!(await canClassify(user_id, null))) {
          return res.status(400).json('You have reached the limit for song classification.');
        }
      }
    }
    // If user is a guest (user_id is 'null'), use IP address for classification limit
    else {
      limit = await howManySongsBasedOnUserIp(ip); // Get classification count by IP

      if (limit >= 1) {
        if (!(await canClassify(null, ip))) {
          return res.status(400).json('You have reached the limit for song classification.');
        }
      }
    }

    // Start the classification process
    startClassification(external_id, user_id, ip);
    return res.status(200).json('The song was added to the queue.');
  } catch (error) {
    console.error(error);
    return res.status(500).json('Internal server error');
  }
};

module.exports = {
  index,
  classify,
  getSegments,
  getVoice,
  getLyrics,
  getInstrumental,
  getLogs,
};
