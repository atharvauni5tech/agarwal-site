'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brokers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      broker_name: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      },
      mobile_number: {
        type: Sequelize.STRING
      },
      alternate_mobile: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      pan_number: {
        type: Sequelize.STRING
      },
      gst_number: {
        type: Sequelize.STRING
      },
      rera_registration_number: {
        type: Sequelize.STRING
      },
      address_line_1: {
        type: Sequelize.STRING
      },
      address_line_2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      pincode: {
        type: Sequelize.STRING
      },
      email_verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      mobile_verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.INTEGER
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      updated_by: {
        type: Sequelize.INTEGER
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('brokers');
  }
};