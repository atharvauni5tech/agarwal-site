'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LeadActivityLog extends Model {
    static associate(models) {
      LeadActivityLog.belongsTo(models.leads, {
        foreignKey: 'leadId',
        as: 'lead'
      });
      LeadActivityLog.belongsTo(models.users, {
        foreignKey: 'performedByUserId',
        as: 'performedBy'
      });
    }
  }
  LeadActivityLog.init({
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    performedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    activityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LeadActivityLog',
    tableName: 'lead_activity_logs'
  });
  return LeadActivityLog;
};
