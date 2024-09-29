'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Song_Segments', [
      //Music1 Segments
      {
        song_id: 1,
        source_id: 1,
        start: 0,
        end: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        song_id: 1,
        source_id: 1,
        start: 200,
        end: 255,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 2 Segments
      {
        song_id: 2,
        source_id: 1,
        start: 0,
        end: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 2,
        source_id: 1,
        start: 60,
        end: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 3 Segments
      {
        song_id: 3,
        source_id: 1,
        start: 0,
        end: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 3,
        source_id: 1,
        start: 90,
        end: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 4 Segments
      {
        song_id: 4,
        source_id: 1,
        start: 0,
        end: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 4,
        source_id: 1,
        start: 30,
        end: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
  
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Song_Segments', null, {});
  }
};
