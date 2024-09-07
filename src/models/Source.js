'use strict';

const { Model, DataTypes } = require('sequelize');

class Source extends Model {
  static associate(models) {
    Source.hasMany(models.Song_Classification, { foreignKey: 'source_id' });
    Source.hasMany(models.Song_Segments, { foreignKey: 'source_id' });
  }
}

const defineSourceModel = (sequelize) => {
  Source.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Source',
  });

  return Source;
};

module.exports = defineSourceModel;
