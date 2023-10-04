'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('User', [{
      email: "admin@admin",
      hash_passwd: "admin",
      name: "admin",
      admin: true,
      confirmed: true
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('User', null, {});
  }
};
