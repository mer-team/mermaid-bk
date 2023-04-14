'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Sources', [
    {
        name: "audio"
    }, 

    {
      name: "audio"
    }, 

    {
      name: "audio"
    }, 

    {
      name: "audio"
    }
  ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Sources', null, {});
  }
};
