'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leadDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      leadId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'leads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      occupationCategory: {
        type: Sequelize.STRING,
        allowNull: true
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: true
      },
      preferredConfiguration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedBudget: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sourceOfVisit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      referredBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      houseNo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      buildingOrSocietyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      locality: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('leadDetails');
  }
};
