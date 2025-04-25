'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Song_Segments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Song_Segments.belongsTo(models.Song, { foreignKey: 'song_id' });
      Song_Segments.belongsTo(models.Source, { foreignKey: 'source_id' });
    }
  }
  Song_Segments.init(
    {
      song_id: DataTypes.INTEGER,
      source_id: DataTypes.INTEGER,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      emotion: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Song_Segments',
    },
  );
  return Song_Segments;
};
