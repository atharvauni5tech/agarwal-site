'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      // Fix 2.1: Declare the FK relationship so Sequelize tracks it properly
      users.belongsTo(models.broker, {
        foreignKey: 'broker_id',
        as: 'broker_profile',
        constraints: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      users.hasMany(models.sales_queues, {
        foreignKey: 'sales_executive_id',
        as: 'queue_entries'
      });
      users.hasMany(models.lead_allocations, {
        foreignKey: 'caller_assigned_id',
        as: 'lead_allocations'});
      users.hasMany(models.visit_allocations, {
        foreignKey: 'sales_executive_id',
        as: 'visit_allocations'
      });
      users.belongsToMany(models.projects, {
        through: models.user_project,
        foreignKey: 'user_id',
        as: 'assigned_projects'
      });
      users.hasOne(models.user_basic_detail, {
        foreignKey: 'user_id',
        as: 'basic_details'
      });
      users.hasMany(models.UserRefreshToken, {
        foreignKey: 'userId',
        as: 'refresh_tokens'
      });
    }
  }
  users.init({
    full_name: DataTypes.STRING,
    contact_number: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    otp: DataTypes.INTEGER,
    otp_expiry_time: DataTypes.DATE,
    last_login_time: DataTypes.DATE,
    status: DataTypes.INTEGER,
    broker_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Fix 2.1: Declare the FK so Sequelize enforces referential integrity
      references: {
        model: 'brokers',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};