require('dotenv').config();
const { Op } = require('sequelize');
const { Song, Sequelize } = require('../models/index');
var search = require('youtube-search');
const formatter = require('../utils/responseFormatter');

var opts = {
  maxResults: 1,
  key: process.env.YOUTUBE_API_KEY,
};

module.exports = {
  //Get the Songs in the database
  async index(req, res) {
    try {
      const songs = await Song.findAll({
        where: {
          status: 'processed',
        },
        order: [['updatedAt', 'DESC']],
      });

      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching songs', 500);
    }
  },

  //Get a song by external_id
  async show(req, res) {
    try {
      const { id } = req.params;

      const songs = await Song.findOne({
        where: {
          external_id: id,
          status: 'processed',
        },
      });

      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching song', 500);
    }
  },

  //Get a song by name
  async filterByName(req, res) {
    try {
      var { title } = req.params;
      title = title.toLowerCase();

      const songs = await Song.findAll({
        where: {
          title: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('title')),
            'LIKE',
            `%${title}%`,
          ),
          status: 'processed',
        },
      });

      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error filtering songs by name', 500);
    }
  },

  //Get a song by emotion
  async filterByEmotion(req, res) {
    try {
      var { emotion } = req.params;
      emotion = emotion.toLowerCase();

      const songs = await Song.findAll({
        where: {
          general_classification: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('general_classification')),
            'LIKE',
            `%${emotion}%`,
          ),
          status: 'processed',
        },
      });

      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error filtering songs by emotion', 500);
    }
  },

  //Get a song by name and emotion
  async filterByAll(req, res) {
    try {
      var { title, emotion } = req.params;
      title = title.toLowerCase();
      emotion = emotion.toLowerCase();
      const songs = await Song.findAll({
        where: {
          title: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('title')),
            'LIKE',
            `%${title}%`,
          ),
          general_classification: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('general_classification')),
            'LIKE',
            `%${emotion}%`,
          ),
          status: 'processed',
        },
      });

      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error filtering songs by name and emotion', 500);
    }
  },

  async updateHits(req, res) {
    try {
      const { song_id } = req.params;

      const song = await Song.findOne({
        where: {
          id: song_id,
        },
      });

      song.hits = song.hits + 1;

      await Song.update({ hits: song.hits }, { where: { id: song_id } });
      return formatter.success(res, { message: 'Hit updated' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error updating hits', 500);
    }
  },

  async getHits(req, res) {
    try {
      const { song_id } = req.params;

      const song = await Song.findOne({
        where: {
          id: song_id,
        },
      });

      return formatter.success(res, { hits: song.hits });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching hits', 500);
    }
  },

  //Get the songs that user added to the queue
  //This is only used if the user is logged
  async getQueueSongs(req, res) {
    const { user_id } = req.params;
    console.log(req.params);
    try {
      const songs = await Song.findAll({
        where: {
          added_by_user: user_id,
          status: {
            [Op.ne]: 'processed',
          },
        },
      });
      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching queued songs', 500);
    }
  },

  //This is used if the user is not logged
  async getQueueSongsByIp(req, res) {
    try {
      //console.log("This is the user %s", req.clientIp)
      const songs = await Song.findAll({
        where: {
          added_by_ip: req.clientIp,
          status: {
            [Op.ne]: 'processed',
          },
        },
      });
      return formatter.success(res, songs);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching queued songs by IP', 500);
    }
  },

  async deleteSong(req, res) {
    try {
      const songs = await Song.destroy({
        where: {
          external_id: req.params.id,
        },
      });
      return formatter.success(res, { message: 'Song deleted successfully' });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error deleting song', 500);
    }
  },

  async getStreamedMinutes(req, res) {
    try {
      var x = 0;
      var total = 0;
      const songs = await Song.findAll();
      songs.map((song) => {
        x = new Date(song.duration).getMinutes();
        total += x;
      });
      return formatter.success(res, { totalStreamedMinutes: total });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error calculating streamed minutes', 500);
    }
  },

  async AnalysedVideos(req, res) {
    try {
      const songs = await Song.findAll();
      return formatter.success(res, { totalAnalysedVideos: songs.length });
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching analysed videos', 500);
    }
  },

  async getLatestClassifications(req, res) {
    try {
      const songs = await Song.findAll({
        where: {
          status: 'processed',
        },
        order: [['updatedAt', 'DESC']], // Order by "updated_at" field in descending order
        limit: 3, // Limit the result to 3 entries
      });

      //songs.sort((a, b) => a.updated_at - b.updated_at)

      return res.status(200).json(songs.slice(0, 3));
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching latest classifications', 500);
    }
  },
};
