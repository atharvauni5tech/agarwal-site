'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lead_allocations extends Model {
    static associate(models) {
      lead_allocations.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      lead_allocations.belongsTo(models.users, { foreignKey: 'caller_assigned_id', as: 'callerExecutive' });
    }
  }
  lead_allocations.init({
    lead_id: DataTypes.INTEGER,
    caller_assigned_id: DataTypes.INTEGER,
    assigned_at: DataTypes.DATE,
    status: DataTypes.INTEGER,
    action_taken: DataTypes.STRING,
    contacted_at: DataTypes.DATE,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'lead_allocations',
  });
  return lead_allocations;
};
