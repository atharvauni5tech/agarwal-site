'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InAppNotification extends Model {
    static associate(models) {
      InAppNotification.belongsTo(models.users, {
        foreignKey: 'recipientId',
        as: 'recipient',
        onDelete: 'CASCADE'
      });
    }
  }
  InAppNotification.init({
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'InAppNotification',
    tableName: 'InAppNotifications'
  });
  return InAppNotification;
};
