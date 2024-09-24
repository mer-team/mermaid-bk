'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Song_Classifications', [
      //Music 1 Classification
      {
        song_id: 1,
        source_id: 1,
        emotion: "Happy",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      //Music 2 Classification
      {
        song_id: 2,
        source_id: 1,
        emotion: "Calm",
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 3 Classification
      {
        song_id: 3,
        source_id: 1,
        emotion: "Happy",
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 4 Classification
      {
        song_id: 4,
        source_id: 1,
        emotion: "Happy",
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
  
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Song_Classifications', null, {});
  }
};
