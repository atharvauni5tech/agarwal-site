'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class leads extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      leads.belongsTo(models.customers, {
        foreignKey: 'customer_id',
        as: 'customer_detail'
      });
      leads.belongsTo(models.projects, {
        foreignKey: 'project',
        as: 'project_detail'
      });
      leads.hasMany(models.lead_allocations, {
        foreignKey: 'lead_id',
        as: 'allocations'
      });
      leads.hasOne(models.bookings, {
        foreignKey: 'lead_id',
        as: 'booking'
      });
      leads.hasMany(models.visits, {
        foreignKey: 'lead_id',
        as: 'visits'
      });
      leads.hasMany(models.LeadActivityLog, {
        foreignKey: 'leadId',
        as: 'activityLogs'
      });
      leads.hasMany(models.lead_notes, {
        foreignKey: 'lead_id',
        as: 'notes'
      });
      leads.hasMany(models.lead_reminders, {
        foreignKey: 'lead_id',
        as: 'reminders'
      });
      leads.hasMany(models.lead_tasks, {
        foreignKey: 'lead_id',
        as: 'tasks'
      });
      leads.hasMany(models.visit_allocations, {
        foreignKey: 'lead_id',
        as: 'visitAllocations'
      });
    }
  }
    leads.init({
    customer_id: DataTypes.INTEGER,
    lead_id: DataTypes.STRING,
    city: DataTypes.STRING,
    project: DataTypes.JSON,
    unit_type: DataTypes.STRING,
    budget: DataTypes.STRING,
    expected_booking_duration: DataTypes.STRING,
    scheduled_visit_date: DataTypes.DATE,
    scheduled_visit_time: DataTypes.DATE,
    stage: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    action_taken: DataTypes.STRING,
    tag: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'leads',
  });
  return leads;
};