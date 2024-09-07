'use strict';

const { Model, DataTypes } = require('sequelize');

class Song_Segments extends Model {
  static associate(models) {
    Song_Segments.belongsTo(models.Song, { foreignKey: 'song_id' });
    Song_Segments.belongsTo(models.Source, { foreignKey: 'source_id' });
  }
}

const defineSongSegmentsModel = (sequelize) => {
  Song_Segments.init({
    song_id: DataTypes.INTEGER,
    source_id: DataTypes.INTEGER,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    emotion: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Song_Segments',
  });

  return Song_Segments;
};

module.exports = defineSongSegmentsModel;
