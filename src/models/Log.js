'use strict';

const { Model, DataTypes } = require('sequelize');

class Log extends Model {
  static associate(models) {
    Log.belongsTo(models.Song, { foreignKey: 'song_id' });
  }
}

const defineLogModel = (sequelize) => {
  Log.init({
    message: DataTypes.STRING,
    service: DataTypes.STRING,
    song_id: DataTypes.INTEGER,
    type: DataTypes.ENUM("info", "warning", "error"),
  }, {
    sequelize,
    modelName: 'Log',
  });

  return Log;
};

module.exports = defineLogModel;
