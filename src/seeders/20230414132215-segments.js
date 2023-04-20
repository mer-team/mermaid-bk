'use strict';

//Music 1
const start1_1 = new Date(0, 0, 0, 0, 0, 0)
const start1_2 = new Date(0, 0, 0, 0, 2, 32)

const end1_1 = new Date(0, 0, 0, 0, 2, 31)
const end1_2 = new Date(0, 0, 0, 0, 3, 32)

//Music 2
const start2_1 = new Date(0, 0, 0, 0, 0, 0)
const start2_2 = new Date(0, 0, 0, 0, 3, 30)

const end2_1 = new Date(0, 0, 0, 0, 3, 29)
const end2_2 = new Date(0, 0, 0, 0, 5, 36)

//Music 3
const start3_1 = new Date(0, 0, 0, 0, 0, 0)
const start3_2 = new Date(0, 0, 0, 0, 1, 20)

const end3_1 = new Date(0, 0, 0, 0, 1, 19)
const end3_2 = new Date(0, 0, 0, 0, 3, 22)

//Music 4
const start4_1 = new Date(0, 0, 0, 0, 0, 0)
const start4_2 = new Date(0, 0, 0, 0, 2, 32)

const end4_1 = new Date(0, 0, 0, 0, 2, 31)
const end4_2 = new Date(0, 0, 0, 0, 3, 30)

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Song_Segments', [
      //Music1 Segments
      {
        song_id: 1,
        source_id: 1,
        start: start1_1,
        end: end1_1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        song_id: 1,
        source_id: 1,
        start: start1_2,
        end: end1_2,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 2 Segments
      {
        song_id: 2,
        source_id: 1,
        start: start2_1,
        end: end2_1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 2,
        source_id: 1,
        start: start2_2,
        end: end2_2,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 3 Segments
      {
        song_id: 3,
        source_id: 1,
        start: start3_1,
        end: end3_1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 3,
        source_id: 1,
        start: start3_2,
        end: end3_2,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 

      //Music 4 Segments
      {
        song_id: 4,
        source_id: 1,
        start: start4_1,
        end: end4_1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        song_id: 4,
        source_id: 1,
        start: start4_2,
        end: end4_2,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
  
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Song_Segments', null, {});
  }
};
