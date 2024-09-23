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
      link: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      artist: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.INTEGER
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
        type: Sequelize.TEXT
      },
      hits: {
        type: Sequelize.INTEGER
      },
      waveform: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM("queued", "processing", "processed", "error", "cancelled")
      },
      thumbnailHQ: {
        type: Sequelize.STRING
      }, 
      thumbnailMQ: {
        type: Sequelize.STRING
      }, 
      general_classification: {
        type: Sequelize.STRING
      }, 
      added_by_ip: {
        type: Sequelize.STRING
      },
      added_by_user: {
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