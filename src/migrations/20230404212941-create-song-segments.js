'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Song_Segments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      song_id: {
        type: Sequelize.INTEGER, 
        references: {model: "Songs", key: "id"}, 
        onUpdate: "CASCADE", 
        onDelete: "CASCADE"
      },
      source_id: {
        type: Sequelize.INTEGER, 
        references: {model: "Sources", key: "id"}, 
        onUpdate: "CASCADE", 
        onDelete: "CASCADE"
      },
      start: {
        type: Sequelize.INTEGER
      },
      end: {
        type: Sequelize.INTEGER
      },
      emotion: {
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
    await queryInterface.dropTable('Song_Segments');
  }
};