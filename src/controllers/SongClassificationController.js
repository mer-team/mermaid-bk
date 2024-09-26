require('dotenv').config();

const { Song_Classification, Log, Song } = require('../models/Index');
const axios = require('axios');
const async = require('async');
const { Op } = require('sequelize');
const search = require('youtube-search');
const { sendMessage } = require('../Services/rabbitmqService');
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
  const opts = {
    key: API_KEY,
  };

  search(`https://www.youtube.com/watch?v=${songId}`, opts, async (err, results) => {
    if (err) {
      console.error(err);
      return;
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

      // Convert ISO 8601 duration to seconds
      const durationInSeconds = convertIso8601DurationToSeconds(duration);

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
    } catch (e) {
      console.error('Error saving song:', e);
    }
  });
};

const updateStateSong = async (status, songId) => {
  try {
    await Song.update({ status }, { where: { external_id: songId } });
  } catch (e) {
    console.error(e);
  }
};

const updateProcessed = async (emotion, songId) => {
  try {
    await Song.update(
      {
        status: 'processed',
        general_classification: emotion,
      },
      { where: { external_id: songId } }
    );
  } catch (e) {
    console.error(e);
  }
};

// List of classification of the songs
const classificationQueue = async.queue(async (song, callback) => {
  const songSocket = request.connectedSong[song];
  try {
    await updateStateSong('processing', song);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 10,
          song_id: `${song}`,
          state: 'Song Received',
        });
      }
    }, 6000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 30,
          song_id: `${song}`,
          state: 'Video Downloaded',
        });
        const songDetails = await Song.findOne({ where: { external_id: song } });
        await sendMessage(
          'videoDownloadQueue',
          `Video downloaded for song ID: ${song}, Title: ${songDetails.title}`
        );
      }
    }, 8000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 50,
          song_id: `${song}`,
          state: 'Audio Channel Extracted from Audio',
        });
      }
    }, 10000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 60,
          song_id: `${song}`,
          state: 'Features Extracted',
        });
      }
    }, 12000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 80,
          song_id: `${song}`,
          state: 'Classification in Process',
        });
      }
    }, 15000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 100,
          song_id: `${song}`,
          state: 'Classification Finished',
        });
      }

      const emotions = ['Happy', 'Sad', 'Calm', 'Tense'];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      await updateProcessed(emotion, song);

      request.io.emit('song-classified', {
        songId: song,
        message: 'The song classification is finished',
      });
    }, 16000);
  } catch (error) {
    await updateStateSong('error', song);
    console.error('Error:', error);
    callback(error);
  }
}, 1);

const startClassification = (song, user, ip) => {
  saveTheSong(song, user, ip);
  classificationQueue.push(song, error => {
    if (error) {
      console.error(error);
    } else {
      console.log('The song was classified');
    }
  });
};

const isAlreadyOnTheDatabase = async song_id => {
  return await Song.findOne({ where: { external_id: song_id } });
};

const howManySongsBasedOnUserId = async id => {
  const songs = await Song.findAll({
    where: {
      added_by_user: id,
      status: { [Op.ne]: 'processed' },
    },
  });
  return songs.length;
};

const howManySongsBasedOnUserIp = async (ip) => {
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
      limit = await howManySongsBasedOnUserIp(ip);  // Get classification count by IP

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
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  index,
  classify,
};
