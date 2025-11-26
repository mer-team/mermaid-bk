require('dotenv').config();

const { Op, Sequelize } = require('sequelize');
const { Song } = require('../models/Index');

const API_KEY = process.env.YOUTUBE_API_KEY;

const index = async (req, res) => {
  try {
    const songs = await Song.findAll({
      where: { status: 'processed' },
      order: [['updatedAt', 'DESC']],
    });
    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const show = async (req, res) => {
  try {
    const { external_id } = req.params;
    const song = await Song.findOne({
      where: { external_id, status: 'processed' },
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    return res.status(200).json(song);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const filterByTitleAndArtist = async (req, res) => {
  try {
    const { title } = req.params;

    // Step 1: Search for songs by title
    const titleMatches = await Song.findAll({
      where: {
        title: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('title')),
          'LIKE',
          `%${title.toLowerCase()}%`,
        ),
        status: 'processed',
      },
    });

    // Step 2: Search for songs by artist
    const artistMatches = await Song.findAll({
      where: {
        artist: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('artist')),
          'LIKE',
          `%${title.toLowerCase()}%`,
        ),
        status: 'processed',
      },
    });

    // Step 3: Combine results and remove duplicates
    const allMatches = [...titleMatches, ...artistMatches].filter(
      (song, index, self) => index === self.findIndex((s) => s.id === song.id), // Remove duplicates based on the song ID
    );

    // Return the combined list of songs
    return res.status(200).json(allMatches);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const filterByEmotion = async (req, res) => {
  try {
    const { emotion } = req.params;
    const songs = await Song.findAll({
      where: {
        general_classification: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('general_classification')),
          'LIKE',
          `%${emotion.toLowerCase()}%`,
        ),
        status: 'processed',
      },
    });
    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const filterByAll = async (req, res) => {
  try {
    const { title, emotion } = req.params;
    const songs = await Song.findAll({
      where: {
        title: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('title')),
          'LIKE',
          `%${title.toLowerCase()}%`,
        ),
        general_classification: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('general_classification')),
          'LIKE',
          `%${emotion.toLowerCase()}%`,
        ),
        status: 'processed',
      },
    });
    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Track recent hits to prevent duplicate counting (in-memory cache)
const recentHits = new Map();
const HIT_COOLDOWN_MS = 60000; // 1 minute cooldown per user per song

const updateHits = async (req, res) => {
  try {
    const { song_id } = req.params;
    const userIdentifier = req.clientIp || req.headers['x-forwarded-for'] || 'unknown';
    const hitKey = `${song_id}-${userIdentifier}`;

    // Check if this user recently hit this song
    const lastHitTime = recentHits.get(hitKey);
    const now = Date.now();

    if (lastHitTime && now - lastHitTime < HIT_COOLDOWN_MS) {
      // Too soon, don't increment
      return res.status(200).json('Hit already counted recently');
    }

    const [affectedRows] = await Song.update(
      { hits: Sequelize.literal('hits + 1') },
      { where: { id: song_id } },
    );

    if (affectedRows === 0) return res.status(404).json({ message: 'Song not found' });

    // Store the hit timestamp
    recentHits.set(hitKey, now);

    // Clean up old entries periodically (prevent memory leak)
    if (recentHits.size > 10000) {
      const cutoffTime = now - HIT_COOLDOWN_MS;
      for (const [key, time] of recentHits.entries()) {
        if (time < cutoffTime) {
          recentHits.delete(key);
        }
      }
    }

    return res.status(200).json('Hit updated');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getHits = async (req, res) => {
  try {
    const { song_id } = req.params;
    const song = await Song.findOne({
      where: { id: song_id },
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    return res.status(200).json(song.hits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getQueueSongs = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Build where clause to include songs from both user_id and IP
    const whereClause = {
      status: { [Op.ne]: 'processed' },
      [Op.or]: []
    };

    // Add user_id filter if provided
    if (user_id && user_id !== 'null' && user_id !== '0' && user_id !== 'undefined') {
      whereClause[Op.or].push({ added_by_user: user_id });
    }

    // Also include songs from this IP (for guest songs)
    if (req.clientIp) {
      whereClause[Op.or].push({ added_by_ip: req.clientIp });
    }

    // If no filters, show nothing
    if (whereClause[Op.or].length === 0) {
      return res.status(200).json([]);
    }

    const songs = await Song.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // Show newest first
    });

    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getQueueSongsByIp = async (req, res) => {
  try {
    const songs = await Song.findAll({
      where: {
        added_by_ip: req.clientIp,
        status: { [Op.ne]: 'processed' },
      },
    });
    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Song.destroy({
      where: { external_id: id },
    });
    if (result === 0) return res.status(404).json({ message: 'Song not found' });
    return res.status(200).json('Song deleted successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getStreamedMinutes = async (req, res) => {
  try {
    let total = 0;

    const songs = await Song.findAll();

    // Convert duration from seconds to minutes and sum it
    songs.forEach((song) => {
      total += Math.floor(song.duration / 60); // Convert seconds to minutes and round down
    });

    return res.status(200).json(total); // Return total minutes as an integer
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const analysedVideos = async (req, res) => {
  try {
    const songs = await Song.findAll();
    return res.status(200).json(songs.length);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getLatestClassifications = async (req, res) => {
  try {
    const songs = await Song.findAll({
      where: { status: 'processed' },
      order: [['updatedAt', 'DESC']],
      limit: 3,
    });
    return res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  index,
  show,
  filterByTitleAndArtist,
  filterByEmotion,
  filterByAll,
  updateHits,
  getHits,
  getQueueSongs,
  getQueueSongsByIp,
  deleteSong,
  getStreamedMinutes,
  analysedVideos,
  getLatestClassifications,
};
