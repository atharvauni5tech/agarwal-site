'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class whatsappTemplates extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  whatsappTemplates.init({
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
    interaktTemplateName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    headerValuesConfig: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bodyValuesConfig: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'whatsappTemplates',
    tableName: 'whatsapp_templates',
    timestamps: true
  });
  return whatsappTemplates;
};
