'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class smsTemplates extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  smsTemplates.init({
    templateName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    templateCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    templateBody: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'smsTemplates',
    tableName: 'sms_templates',
    timestamps: true
  });
  return smsTemplates;
};
