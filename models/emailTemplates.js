'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class emailTemplates extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  emailTemplates.init({
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
    subject: {
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
    modelName: 'emailTemplates',
    tableName: 'email_templates',
    timestamps: true
  });
  return emailTemplates;
};
