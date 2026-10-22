'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Atharva Pandharikar',
        email: 'atharva.pandharikar@uni5.tech',
        role: 'ADMIN',
        status: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Arya Patil',
        email: 'arya.patil@edba.io',
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
        'atharva.pandharikar@uni5.tech',
        'arya.patil@edba.io'
      ]
    }, {});
  }
};
