'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sources', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      song_id: {
        type: Sequelize.INTEGER,
        references: { model: "Songs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      lyrics: {
        type: Sequelize.STRING
      },
      intrumental: {
        type: Sequelize.STRING
      },
      voice: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Sources');
  }
};