'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CareerApplication extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  CareerApplication.init(
    {
      appliedForPosition: {
        type: DataTypes.STRING,
        allowNull: false
      },
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
      resumeUploadLink: {
        type: DataTypes.TEXT,
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
      modelName: 'CareerApplication',
      tableName: 'careerApplications'
    }
  );

  return CareerApplication;
};
