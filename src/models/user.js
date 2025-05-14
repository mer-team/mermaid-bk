'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Feedback, { foreignKey: 'user_id' });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      hash_passwd: DataTypes.STRING,
      name: DataTypes.STRING,
      admin: DataTypes.BOOLEAN,
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
