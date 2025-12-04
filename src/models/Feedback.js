'use strict';

const { Model, DataTypes } = require('sequelize');

class Feedback extends Model {
  static associate(models) {
    Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
    Feedback.belongsTo(models.Song_Classification, { foreignKey: 'song_id' });
  }
}

const defineFeedbackModel = (sequelize) => {
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

module.exports = defineFeedbackModel;
