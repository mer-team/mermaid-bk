'use strict';

const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static associate(models) {
    User.hasMany(models.Feedback, { foreignKey: 'user_id' });
  }
}

const defineUserModel = (sequelize) => {
  User.init(
    {
      email: DataTypes.STRING,
      hash_passwd: DataTypes.STRING,
      name: DataTypes.STRING,
      admin: DataTypes.BOOLEAN,
      profilePicture: DataTypes.STRING,
      confirmed: DataTypes.BOOLEAN,
      reset_password_token: DataTypes.STRING,
      reset_password_token_at: DataTypes.STRING,
      blocked_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );

  return User;
};

module.exports = defineUserModel;
