'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Songs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      external_id: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      artist: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.DATE
      },
      year: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      genre: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      likes: {
        type: Sequelize.INTEGER
      },
      views: {
        type: Sequelize.INTEGER
      },
      comments: {
        type: Sequelize.STRING
      },
      hits: {
        type: Sequelize.INTEGER
      },
      waveform: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      added_by_ip: {
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
    await queryInterface.dropTable('Songs');
  }
};