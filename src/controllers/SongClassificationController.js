require('dotenv').config();

const { Song_Classification, Log, Song, Song_Segments, Source } = require('../models/Index');
const axios = require('axios');
const async = require('async');
const search = require('youtube-search');
const path = require('path');
const { getVideoProcessingResults } = require('../Services/mongodbService');

// RabbitMQ
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
          genre: '', //'Salsa, Kuduro, Romance', // Default value
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

    const song = await Song.findOne({ where: { id: song_id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Fetch from MongoDB
    const mongoData = await getVideoProcessingResults(song.external_id);
    if (!mongoData || !mongoData.stages?.segmentation) {
      return res.status(404).json({ message: 'Segments not found' });
    }

    // Extract segment count and generate segment URLs
    const segmentCount = mongoData.stages.segmentation.segment_count || 0;
    const formattedSegments = [];

    // Generate segment info - files are named {title}_segment_{index}.wav
    for (let i = 0; i < segmentCount; i++) {
      const paddedIndex = String(i).padStart(3, '0');
      formattedSegments.push({
        index: i,
        url: `${req.protocol}://${req.get('host')}/songSegments/${encodeURIComponent(song.title)}/${encodeURIComponent(song.title)}_segment_${paddedIndex}.wav`,
      });
    }

    return res.status(200).json(formattedSegments);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getStems = async (req, res) => {
  try {
    const { song_id } = req.params;

    const song = await Song.findOne({ where: { id: song_id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Fetch from MongoDB
    const mongoData = await getVideoProcessingResults(song.external_id);
    if (!mongoData || !mongoData.stages?.separation) {
      return res.status(404).json({ message: 'Stems not found' });
    }

    const stems = [];
    const stemTypes = mongoData.stages.separation.stems || ['vocals', 'bass', 'drums', 'other'];

    // Map MongoDB stems to API URLs
    for (const stemType of stemTypes) {
      const fileName = `${stemType}.mp3`;
      stems.push({
        name: stemType.charAt(0).toUpperCase() + stemType.slice(1),
        url: `${req.protocol}://${req.get('host')}/songVocals/htdemucs/${encodeURIComponent(song.title)}/${fileName}`,
      });
    }

    return res.status(200).json(stems);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getFullLyrics = async (req, res) => {
  try {
    const { song_id } = req.params;

    const song = await Song.findOne({ where: { id: song_id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Fetch from MongoDB
    const mongoData = await getVideoProcessingResults(song.external_id);
    const transcriptionFull = mongoData?.stages?.transcription_full;

    if (!transcriptionFull || transcriptionFull.status !== 'completed') {
      return res.status(404).json({ message: 'Full lyrics not available' });
    }

    // Return lyrics directly from MongoDB document
    const lyricsContent = transcriptionFull.lyrics || '';
    return res.status(200).json(lyricsContent)
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getVocalLyrics = async (req, res) => {
  try {
    const { song_id } = req.params;

    const song = await Song.findOne({ where: { id: song_id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Fetch from MongoDB
    const mongoData = await getVideoProcessingResults(song.external_id);

    // Try vocal lyrics first, fallback to full lyrics
    const transcriptionVocals = mongoData?.stages?.transcription_vocals;
    const transcriptionFull = mongoData?.stages?.transcription_full;

    let lyricsContent = '';
    if (transcriptionVocals && transcriptionVocals.status === 'completed' && transcriptionVocals.lyrics) {
      lyricsContent = transcriptionVocals.lyrics;
    } else if (transcriptionFull && transcriptionFull.status === 'completed' && transcriptionFull.lyrics) {
      lyricsContent = transcriptionFull.lyrics;
    } else {
      return res.status(404).json({ message: 'Lyrics not found' });
    }

    return res.status(200).json(lyricsContent)
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

const checkStatus = async (req, res) => {
  try {
    const { external_id } = req.params;

    const song = await Song.findOne({
      where: { external_id },
      attributes: ['id', 'external_id', 'status', 'title', 'artist'],
    });

    if (!song) {
      // Song not in database
      return res.status(200).json({
        exists: false,
        status: null,
        message: 'Song not found in database',
      });
    }

    // Song exists, return its status
    return res.status(200).json({
      exists: true,
      status: song.status,
      song: {
        id: song.id,
        external_id: song.external_id,
        title: song.title,
        artist: song.artist,
      },
    });
  } catch (error) {
    console.error('Error checking song status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const classify = async (req, res) => {
  try {
    const { external_id, user_id } = req.params;
    let ip = req.clientIp; // IP for guests

    request = req;

    console.log(`[Classify] external_id: ${external_id}, user_id: ${user_id}, ip: ${ip}`);

    // Check if the song is already in the queue
    if (await isAlreadyOnTheDatabase(external_id)) {
      console.log('[Classify] Song already in database');
      return res.status(400).json('This song is already in the queue for classification.');
    }

    let limit;

    // If user is logged in (user_id is not 'null'), use user ID for classification limit
    if (user_id !== 'null') {
      limit = await howManySongsBasedOnUserId(user_id); // Get classification count by user ID
      console.log(`[Classify] User ${user_id} has classified ${limit} songs`);

      if (limit % 5 === 0 && limit > 0) {
        if (!(await canClassify(user_id, null))) {
          console.log('[Classify] User limit reached');
          return res.status(400).json('You have reached the limit for song classification.');
        }
      }
    }
    // If user is a guest (user_id is 'null'), use IP address for classification limit
    else {
      limit = await howManySongsBasedOnUserIp(ip); // Get classification count by IP
      console.log(`[Classify] Guest IP ${ip} has classified ${limit} songs`);

      // TODO: Re-enable rate limiting in production
      // Temporarily disabled for testing
      /*
      if (limit >= 1) {
        const canClassifyResult = await canClassify(null, ip);
        console.log(`[Classify] Can classify result: ${canClassifyResult}`);
        if (!canClassifyResult) {
          console.log('[Classify] Guest limit reached - need to wait 24 hours');
          return res.status(400).json('You have reached the limit for song classification.');
        }
      }
      */
    }

    // Start the classification process
    console.log('[Classify] Starting classification...');
    startClassification(external_id, user_id, ip);
    return res.status(200).json('The song was added to the queue.');
  } catch (error) {
    console.error('[Classify] Error:', error);
    return res.status(500).json('Internal server error');
  }
};

module.exports = {
  index,
  classify,
  checkStatus,
  getSegments,
  getStems,
  getFullLyrics,
  getVocalLyrics,
  getVoice,
  getLyrics,
  getInstrumental,
  getLogs,
};
