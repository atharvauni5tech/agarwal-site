'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChannelPartner extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  ChannelPartner.init(
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      firmOrCompanyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reraRegNo: {
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
      cityOfOperation: {
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
      modelName: 'ChannelPartner',
      tableName: 'channelPartners'
    }
  );

  return ChannelPartner;
};
