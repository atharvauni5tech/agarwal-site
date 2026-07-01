'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class visits extends Model {
    static associate(models) {
      visits.belongsTo(models.customers, { foreignKey: 'customer_id', as: 'customer' });
      visits.belongsTo(models.broker, { foreignKey: 'broker_id', as: 'broker' });
      visits.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      visits.belongsTo(models.projects, { foreignKey: 'project_id', as: 'project' });
      visits.hasOne(models.visit_allocations, { foreignKey: 'visit_id', as: 'allocation' });
      visits.belongsTo(models.users, { foreignKey: 'created_by', as: 'created_by_detail' });
    }
  }
    visits.init({
    customer_id: DataTypes.INTEGER,
    broker_id: DataTypes.INTEGER,
    project_id: {
      type: DataTypes.JSON,
      allowNull: true
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    visit_code: DataTypes.STRING,
    qr_code_url: DataTypes.STRING,
    scheduled_date: DataTypes.DATEONLY,
    scheduled_time: DataTypes.TIME,
    check_in_time: DataTypes.DATE,
    check_in_method: DataTypes.STRING,
    purpose: DataTypes.STRING,
    note: DataTypes.STRING,
    status: DataTypes.INTEGER,
    completed_at: DataTypes.DATE,
    completed_by: DataTypes.INTEGER,
    pickup: DataTypes.INTEGER,
    pickup_location: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'visits',
  });
  return visits;
};
