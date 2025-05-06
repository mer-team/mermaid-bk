'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'admin@admin.com',
        hash_passwd:
          '$2a$10$fiHkA3imwfGcYOTqLkU2Vu9k0U9rqyhkfsi9W9eq64a.9QmqRwdMC',
        name: 'admin',
        admin: true,
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
