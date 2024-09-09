require('dotenv').config();

const { Song_Classification, Log, Song } = require('../models/Index');
const async = require('async');
const { Op } = require('sequelize');
const search = require('youtube-search');
const { sendMessage } = require('../Services/rabbitmqService');
const API_KEY = process.env.YOUTUBE_API_KEY;

let ip, userId, request; // IP of the user

const saveLog = async (msg, id) => {
  try {
    await Log.create({
      message: msg,
      service: 'song classification',
      song_id: id,
      type: 'info',
    });
    console.log('Log created');
  } catch (e) {
    console.error(e);
  }
};

const saveTheSong = songId => {
  const opts = {
    key: API_KEY,
  };

  search(`https://www.youtube.com/watch?v=${songId}`, opts, async (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    try {
      await Song.create({
        external_id: results[0].id,
        link: results[0].link,
        title: results[0].title,
        artist: results[0].channelTitle,
        duration: new Date(0, 0, 0, 0, 2, 20), // Default value
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
        general_classification: '',
      });
      console.log('Song saved');
    } catch (e) {
      console.error(e);
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

const startClassification = song => {
  saveTheSong(song);
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

const howManySongsBasedOnUserIp = async () => {
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

const classify = async (req, res) => {
  try {
    const { external_id, user_id } = req.params;
    ip = req.clientIp;
    request = req;
    userId = user_id;

    if (await isAlreadyOnTheDatabase(external_id)) {
      return res.status(400).json('This song is already in the queue for classification.');
    }

    let lim;
    if (user_id !== 'null') {
      ip = '';
      lim = await howManySongsBasedOnUserId(user_id);
      if (lim >= 6) {
        return res.status(400).json('You have reached the limit for song classification.');
      }
    } else {
      lim = await howManySongsBasedOnUserIp();
      if (lim >= 3) {
        return res.status(400).json('You have reached the limit for song classification.');
      }
    }

    startClassification(external_id);
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
