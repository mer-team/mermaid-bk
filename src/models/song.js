'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Song.hasMany(models.Song_Segments, {foreignKey: 'song_id'})
      Song.hasMany(models.Feedback, {foreignKey: 'song_id'})
      Song.hasMany(models.Song_Classification, {foreignKey: 'song_id'})

      Song.hasOne(models.Log, {foreignKey: 'song_id'})
    }
  }
  Song.init({
    external_id: DataTypes.STRING,
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    duration: DataTypes.DATE,
    year: DataTypes.INTEGER,
    date: DataTypes.DATE,
    genre: DataTypes.STRING,
    description: DataTypes.TEXT,
    hits: DataTypes.INTEGER,
    waveform: DataTypes.STRING,
    status: DataTypes.ENUM("queued", "processing", "processed", "error", "cancelled"),
    added_by_ip: DataTypes.STRING, 
    general_classification: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Song',
  });
  return Song;
};