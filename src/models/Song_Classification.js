'use strict';

const { Model, DataTypes } = require('sequelize');

class Song_Classification extends Model {
  static associate(models) {
    Song_Classification.belongsTo(models.Song, { foreignKey: 'song_id' });
    Song_Classification.belongsTo(models.Source, { foreignKey: 'source_id' });
  }
}

const defineSongClassificationModel = (sequelize) => {
  Song_Classification.init(
    {
      song_id: DataTypes.INTEGER,
      source_id: DataTypes.INTEGER,
      emotion: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Song_Classification',
    },
  );

  return Song_Classification;
};

module.exports = defineSongClassificationModel;
