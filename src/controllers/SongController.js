require('dotenv').config();
const { Op } = require('sequelize');
const { Song, Sequelize } = require('../models/index');
var search = require('youtube-search');

var opts = {
  maxResults: 1,
  key: 'AIzaSyCVdyNQUbauI-DBDZ_a9GoRy3ukrIFiHMU',
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

      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
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

      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
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

      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
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

      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
    }
  },

  //Get a song by name
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

      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
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
      return res.status(200).json('Hit updated');
    } catch (e) {
      console.log(e);
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

      return res.status(200).json(song.hits);
    } catch (e) {
      console.log(e);
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
      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
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
      return res.status(200).json(songs);
    } catch (e) {
      console.log(e);
    }
  },

  async deleteSong(req, res) {
    try {
      const songs = await Song.destroy({
        where: {
          external_id: req.params.id,
        },
      });
      return res.status(200).json('User deleted with sucess');
    } catch (e) {
      console.log(e);
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
      return res.status(200).json(total);
    } catch (e) {
      console.log(e);
    }
  },

  async AnalysedVideos(req, res) {
    try {
      var x = 0;
      var total = 0;
      const songs = await Song.findAll();
      return res.status(200).json(songs.length);
    } catch (e) {
      console.log(e);
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
    }
  },
};
