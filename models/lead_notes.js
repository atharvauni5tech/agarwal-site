'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lead_notes extends Model {
    static associate(models) {
      lead_notes.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
    }
  }
  lead_notes.init({
    lead_id: DataTypes.INTEGER,
    note: DataTypes.TEXT,
    contact_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'lead_notes',
    tableName: 'lead_notes'
  });
  return lead_notes;
};
