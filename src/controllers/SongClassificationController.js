require('dotenv').config();

const { Song_Classification, Log, Song, Song_Segments, Source } = require('../models/Index');
const axios = require('axios');
const async = require('async');
const { Op } = require('sequelize');
const search = require('youtube-search');
const multer = require('multer');
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
        const videoDetailsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            part: 'contentDetails',
            id: videoId,
            key: API_KEY,
          },
        });

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

// Custom delay function (Promise-based timeout)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Polling function to check for the log entry
const pollForLog = async (songId, maxAttempts, interval) => {
  let attempts = 0;
  let log = null;

  while (attempts < maxAttempts) {
    log = await Log.findOne({
      where: { song_id: songId },
      order: [['createdAt', 'DESC']],
    });

    if (log) {
      return log.message; // Log found, return it
    }

    await delay(interval); // Wait for the interval before checking again
    attempts++;
  }
  return null; // Log not found after maxAttempts
};

// Helper function to fetch log and emit progress
const emitProgress = async (songSocket, song_externalID, progress, songId) => {
  try {

    const logMessage = await pollForLog(songId, 10, 1000); // Check up to 10 times, 1-second intervals

    // Emit progress with the log message
    if (songSocket) {
      request.io.emit('progress', {
        progress: progress,
        song_id: `${song_externalID}`,
        state: logMessage,
      });
    }
  } catch (err) {
    console.error('Error fetching log:', err);
  }
};

// List of classification of the songs
const classificationQueue = async.queue(async (song_externalID, callback) => {
  const songSocket = request.connectedSong[song_externalID];
  let rabbitQueue;
  let queueMessage;
  let songId;

  // search for the id of the song we just started to classify
  songId = await Song.findOne({
    where: { external_id: song_externalID }
  });

  try {
    await updateStateSong('processing', song_externalID);

    // Start reading RabbitMQ messages
    // Open a queue for song info
    rabbitQueue = 'song_processing_queue';

    // Message sent to the RabbitMQ with info about the song
    queueMessage = JSON.stringify({
      type: 'song_processing_start',
      data: {
        link: songId.link, // Send the song url link
        title: songId.title,
        song_id: songId.id // Send the PK id from our song databse
      },
    });

    // Sends a message with the songId and title
    sendMessage(rabbitQueue, queueMessage);

    // Open a new queue just for logs
    rabbitQueue = 'song_processing_log';

    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Song Received"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    // Reads the message coming from the queue and stores it in the logs database field
    startConsumer(rabbitQueue);

    await emitProgress(songSocket, song_externalID, 10, songId.id);
    await delay(3000);

    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Video Downloaded"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    await emitProgress(songSocket, song_externalID, 30, songId.id);
    await delay(3000);

    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Audio Channel Extracted from Audio"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    await emitProgress(songSocket, song_externalID, 50, songId.id);
    await delay(3000);

    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Features Extracted"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    await emitProgress(songSocket, song_externalID, 60, songId.id);
    await delay(3000);
    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Classification in Process"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    await emitProgress(songSocket, song_externalID, 80, songId.id);
    await delay(3000);

    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_log',
      data: {
        songId: songId.id,
        logMessage: "Classification Finished"
      }
    });

    sendMessage(rabbitQueue, queueMessage);

    // Random number between 1 and 4
    const segmentCount = Math.floor(Math.random() * 4) + 1;

    // Generate random segments with random emotions
    await generateRandomSegments(songId.id, songId.duration, segmentCount);
    await delay(3000);

    // Receives the complete song analisis back from the microsservices
    rabbitQueue = 'song_processing_completed';

    let segments = await Song_Segments.findAll({ where: { song_id: songId.id } });

    let finalEmotion;

    if (segments && segments.length > 0) {

      const calculatedData = segments.map(segment => ({
        duration: segment.end - segment.start, // Calculate duration
        emotion: segment.emotion,               // Get emotion
      }));

      // Find the longest segment duration
      const longestDuration = Math.max(...calculatedData.map(segment => segment.duration));

      // Find all segments that have the longest duration
      const longestSegments = calculatedData.filter(segment => segment.duration === longestDuration);

      // If there is more than one segment with the longest duration, return 'Mixed'
      finalEmotion = longestSegments.length > 1 ? 'Mixed' : longestSegments[0].emotion;

    }

    /* Use this when you can get the files stored in the server by the microsservices
    const lyricsPath = path.join(__dirname, `../Uploads/SongLyrics/${songId.external_id}_lyrics.txt`);
    const voicePath = path.join(__dirname, `../Uploads/SongVoice/${songId.external_id}_voice.mp3`);
    const instrumentalPath = path.join(__dirname, `../Uploads/SongInstrumental/${songId.external_id}_instrumental.mp3`);
    */

    // Path for the sources (for test purposes only)
    const lyricsPath = path.join(__dirname, `../Uploads/SongLyrics/lyrics.txt`);
    const voicePath = path.join(__dirname, `../Uploads/SongVoice/A203.mp3`);
    const instrumentalPath = path.join(__dirname, `../Uploads/SongInstrumental/A203.mp3`);

    // Final song classification
    // This new message should be sent by the microsservices
    queueMessage = JSON.stringify({
      type: 'song_processing_complete',
      data: {
        songId,
        emotion: finalEmotion,
        lyrics: lyricsPath,
        voice: voicePath,
        instrumental: instrumentalPath
      },
    });

    sendMessage(rabbitQueue, queueMessage);

    startConsumer(rabbitQueue);

    await emitProgress(songSocket, song_externalID, 99, songId.id);
    await delay(3000);

    request.io.emit('song-classified', {
      songId: song_externalID,
      message: 'The song classification is finished',
    });

    await emitProgress(songSocket, song_externalID, 100, songId.id);

  } catch (error) {
    await updateStateSong('error', song_externalID);
    console.error('Error:', error);
  }
}, 1);

const generateRandomSegments = async (songId, duration, segmentCount) => {
  return new Promise((resolve, reject) => {
    try {
      const emotions = ['Happy', 'Sad', 'Calm', 'Tense'];
      const rabbitQueue = 'song_processing_segments';
      startConsumer(rabbitQueue);

      let start = 0;
      let segments = [];

      // Divide the song duration into the given number of segments
      for (let i = 0; i < segmentCount; i++) {
        // Generate a random end time for the segment between start and remaining song duration
        let remainingDuration = duration - start;
        let end;

        if (i === segmentCount - 1) {
          // Make sure the last segment ends exactly at the song's duration
          end = duration;
        } else {
          // Ensure each segment's length is within the remaining duration
          const maxSegmentLength = remainingDuration / (segmentCount - i); // Evenly divide remaining time
          end = start + Math.floor(Math.random() * maxSegmentLength);
        }

        // Pick a random emotion for the segment
        let emotion = emotions[Math.floor(Math.random() * emotions.length)];

        // Create the segment message
        const queueMessage = JSON.stringify({
          type: 'song_segments',
          data: {
            songId: songId,
            segmentStart: start,
            segmentEnd: end,
            emotion: emotion,
          },
        });

        // Push the segment message to an array
        segments.push(queueMessage);

        // Simulate sending the message to the queue
        sendMessage(rabbitQueue, queueMessage);

        // Update start for the next segment
        start = end;

      }

      // Resolve the promise with the generated segments
      resolve(segments);

    } catch (error) {
      reject(error); // In case of an error, reject the promise
    }
  });
};


const startClassification = async (song, user, ip) => {
  await saveTheSong(song, user, ip);

  classificationQueue.push(song, error => {
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
      status: { [Op.ne]: 'processed' },
    },
  });
  return songs.length;
};

const howManySongsBasedOnUserIp = async (ip) => {
  console.log(ip)

  const songs = await Song.findAll({
    where: {
      added_by_ip: ip,
      status: { [Op.ne]: 'processed' },
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

    return res.status(200).json({ songVocalsUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while fetching the voice.' });
  }
};

const getLyrics = async (req, res) => {

  const { song_id } = req.params; // Extract email from request parameters

  try {
    const source = await Source.findOne({ where: { song_id } });

    // Build the URL for the profile picture
    const songLyricsUrl = `${req.protocol}://${req.get('host')}/songLyrics/${path.basename(source.lyrics)}`;

    return res.status(200).json({ songLyricsUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while fetching the lyrics.' });
  }
}

const getInstrumental = async (req, res) => {

  const { song_id } = req.params; // Extract email from request parameters

  try {
    const source = await Source.findOne({ where: { song_id } });

    // Build the URL for the profile picture
    const songInstrumentalUrl = `${req.protocol}://${req.get('host')}/songIntrumentals/${path.basename(source.instrumental)}`;

    return res.status(200).json({ songInstrumentalUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'An error occurred while fetching the instrumental.' });
  }
}

const canClassify = async (userId, ip) => {
  // Retrieve the last classification time based on user or IP
  let song;

  if (userId == null) {
    song = await Song.findOne({
      where: {
        added_by_ip: ip
      },
      order: [['createdAt', 'DESC']],
    });
  } else if (ip == null) {
    song = await Song.findOne({
      where: {
        added_by_user: userId
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

      limit = await howManySongsBasedOnUserId(user_id);  // Get classification count by user ID

      if (limit % 5 === 0 && limit > 0) {
        if (!await canClassify(user_id, null)) {
          return res.status(400).json('You have reached the limit for song classification.');
        }
      }
    }
    // If user is a guest (user_id is 'null'), use IP address for classification limit
    else {
      limit = await howManySongsBasedOnUserIp();  // Get classification count by IP

      if (limit >= 1) {
        if (!await canClassify(null, ip)) {
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
};
