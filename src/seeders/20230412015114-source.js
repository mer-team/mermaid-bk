'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Sources', [
      {
        name: 'audio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'lyrics',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'intrumental',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Sources', null, {});
  },
};
