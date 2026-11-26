'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('newsletters', 'imageRedirectUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'image'
    });
    await queryInterface.addColumn('newsletters', 'htmlContent', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      after: 'description'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('newsletters', 'htmlContent');
    await queryInterface.removeColumn('newsletters', 'imageRedirectUrl');
  }
};
