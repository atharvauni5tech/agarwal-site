'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      Lead.hasOne(models.LeadDetail, {
        foreignKey: 'leadId',
        as: 'leadDetails',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Lead.init(
    {
      fullName: {
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
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      sequelize,
      modelName: 'Lead',
      tableName: 'leads'
    }
  );

  return Lead;
};
