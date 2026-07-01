'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lead_reminders extends Model {
    static associate(models) {
      lead_reminders.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      lead_reminders.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
    }
  }
  lead_reminders.init({
    lead_id: DataTypes.INTEGER,
    reminder_datetime: DataTypes.DATE,
    note: DataTypes.TEXT,
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'lead_reminders',
    tableName: 'lead_reminders'
  });
  return lead_reminders;
};
