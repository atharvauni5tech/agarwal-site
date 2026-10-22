'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Supplier.init(
    {
      supplierName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true
      },
      serviceCategories: {
        type: DataTypes.JSON,
        allowNull: true
      },
      yearsOfExperience: {
        type: DataTypes.STRING,
        allowNull: true
      },
      areaOfOperation: {
        type: DataTypes.STRING,
        allowNull: true
      },
      majorClientServed: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      companyProfileAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      productCatalogueAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rateListAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      projectPortfolioAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      relevantLicencesAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      otherSupportingAttachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      sequelize,
      modelName: 'Supplier',
      tableName: 'suppliers'
    }
  );

  return Supplier;
};
