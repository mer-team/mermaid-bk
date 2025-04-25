'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
      Feedback.belongsTo(models.Song_Classification, { foreignKey: 'user_id' });
    }
  }
  Feedback.init(
    {
      song_id: DataTypes.INTEGER,
      agree: DataTypes.INTEGER,
      disagree: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Feedback',
    },
  );
  return Feedback;
};
