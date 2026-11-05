'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Agarwal Admin',
        email: 'paramount@gmail.com',
        role: 'ADMIN',
        status: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: [
        'paramount@gmail.com'
      ]
    }, {});
  }
};
