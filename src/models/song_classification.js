'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Song_Classification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Song_Classification.belongsTo(models.Song, { foreignKey: 'song_id' });
      Song_Classification.belongsTo(models.Source, { foreignKey: 'source_id' });
    }
  }
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
