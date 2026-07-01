'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    static associate(models) {
      notification.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
    }
  }
  notification.init({
    event_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_by_role: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'notification',
    tableName: 'notifications'
  });
  return notification;
};
