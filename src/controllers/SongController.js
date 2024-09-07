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
    const { id } = req.params;
    const song = await Song.findOne({
      where: { external_id: id, status: 'processed' },
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    return res.status(200).json(song);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const filterByName = async (req, res) => {
  try {
    const { title } = req.params;
    const songs = await Song.findAll({
      where: {
        title: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('title')),
          'LIKE',
          `%${title.toLowerCase()}%`
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

const filterByEmotion = async (req, res) => {
  try {
    const { emotion } = req.params;
    const songs = await Song.findAll({
      where: {
        general_classification: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('general_classification')),
          'LIKE',
          `%${emotion.toLowerCase()}%`
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
          `%${title.toLowerCase()}%`
        ),
        general_classification: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('general_classification')),
          'LIKE',
          `%${emotion.toLowerCase()}%`
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
    const song = await Song.findOne({
      where: { id: song_id },
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    song.hits += 1;
    await Song.update({ hits: song.hits }, { where: { id: song_id } });

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
  try {
    const { user_id } = req.params;
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
    songs.forEach(song => {
      total += new Date(song.duration).getMinutes();
    });
    return res.status(200).json(total);
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
  filterByName,
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
