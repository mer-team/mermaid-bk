'use strict';

const { Model, DataTypes } = require('sequelize');

class Song extends Model {
  static associate(models) {
    Song.hasMany(models.Song_Segments, { foreignKey: 'song_id' });
    Song.hasMany(models.Song_Classification, { foreignKey: 'song_id' });
    Song.hasMany(models.Feedback, { foreignKey: 'song_id' });
    Song.hasOne(models.Log, { foreignKey: 'song_id' });
  }
}

const defineSongModel = (sequelize) => {
  Song.init({
    external_id: DataTypes.STRING,
    link: DataTypes.STRING,
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    duration: DataTypes.STRING,
    year: DataTypes.INTEGER,
    date: DataTypes.DATE,
    genre: DataTypes.STRING,
    description: DataTypes.TEXT,
    thumbnailHQ: DataTypes.STRING,
    thumbnailMQ: DataTypes.STRING,
    hits: DataTypes.INTEGER,
    waveform: DataTypes.STRING,
    status: DataTypes.ENUM("queued", "processing", "processed", "error", "cancelled"),
    added_by_ip: DataTypes.STRING,
    added_by_user: DataTypes.STRING,
    general_classification: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Song',
  });

  return Song;
};

module.exports = defineSongModel;
