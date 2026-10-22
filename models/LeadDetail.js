'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LeadDetail extends Model {
    static associate(models) {
      LeadDetail.belongsTo(models.Lead, {
        foreignKey: 'leadId',
        as: 'lead',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  LeadDetail.init(
    {
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'leads',
          key: 'id'
        }
      },
      occupationCategory: {
        type: DataTypes.STRING,
        allowNull: true
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true
      },
      preferredConfiguration: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estimatedBudget: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sourceOfVisit: {
        type: DataTypes.STRING,
        allowNull: true
      },
      referredBy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      houseNo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      buildingOrSocietyName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      locality: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'LeadDetail',
      tableName: 'leadDetails'
    }
  );

  return LeadDetail;
};
