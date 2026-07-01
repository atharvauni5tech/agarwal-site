'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class eventNotificationSettings extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  eventNotificationSettings.init({
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    whatsappEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'eventNotificationSettings',
    tableName: 'event_notification_settings',
    timestamps: true
  });
  return eventNotificationSettings;
};
