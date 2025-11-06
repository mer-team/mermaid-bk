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

const updateHits = async (req, res) => {
  try {
    const { song_id } = req.params;
    const [affectedRows] = await Song.update(
      { hits: Sequelize.literal('hits + 1') },
      { where: { id: song_id } },
    );

    if (affectedRows === 0) return res.status(404).json({ message: 'Song not found' });

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
    const songs = await Song.findAll({
      where: {
        added_by_user: user_id,
        status: { [Op.ne]: 'processed' },
      },
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
