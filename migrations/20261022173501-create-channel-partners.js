'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('channelPartners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firmOrCompanyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reraRegNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cityOfOperation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('channelPartners', ['email']);
    await queryInterface.addIndex('channelPartners', ['mobileNumber']);
    await queryInterface.addIndex('channelPartners', ['reraRegNo']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('channelPartners');
  }
};
