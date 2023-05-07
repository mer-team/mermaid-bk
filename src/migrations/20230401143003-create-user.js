'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      hash_passwd: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      admin: {
        type: Sequelize.BOOLEAN
      },
      reset_password_token: {
        type: Sequelize.STRING
      },
      reset_password_token_at: {
        type: Sequelize.STRING
      },
      confirmed: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      }, 
      blocked_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};