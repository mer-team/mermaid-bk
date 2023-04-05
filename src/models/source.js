'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Source extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Source.hasMany(models.Song_Classification, {foreignKey: 'source_id'})
    }
  }
  Source.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Source',
  });
  return Source;
};