'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lead_tasks extends Model {
    static associate(models) {
      lead_tasks.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      lead_tasks.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
      lead_tasks.belongsTo(models.users, { foreignKey: 'updated_by', as: 'updater' });
    }
  }
  lead_tasks.init({
    lead_id: DataTypes.INTEGER,
    task_name: DataTypes.STRING,
    reminder_datetime: DataTypes.DATE,
    note: DataTypes.STRING,
    due_date: DataTypes.DATE,
    repeat: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'lead_tasks',
    tableName: 'lead_tasks'
  });
  return lead_tasks;
};
