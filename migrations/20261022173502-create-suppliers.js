'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('suppliers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      supplierName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyName: {
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
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      serviceCategories: {
        type: Sequelize.JSON,
        allowNull: true
      },
      yearsOfExperience: {
        type: Sequelize.STRING,
        allowNull: true
      },
      areaOfOperation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      majorClientServed: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      companyProfileAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      productCatalogueAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rateListAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      projectPortfolioAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      relevantLicencesAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      otherSupportingAttachment: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('suppliers', ['email']);
    await queryInterface.addIndex('suppliers', ['mobileNumber']);
    await queryInterface.addIndex('suppliers', ['companyName']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('suppliers');
  }
};
