'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class projects extends Model {
    static associate(models) {
      projects.belongsTo(models.masters, {
        foreignKey: 'project_type_id',
        as: 'project_type_detail'
      });
      projects.belongsTo(models.masters, {
        foreignKey: 'project_status_id',
        as: 'project_status_detail'
      });
      projects.belongsToMany(models.users, {
        through: models.user_project,
        foreignKey: 'project_id',
        as: 'assigned_agents'
      });
      projects.belongsTo(models.users, {
        foreignKey: 'created_by',
        as: 'created_by_detail'
      });
      projects.hasMany(models.bookings, {
        foreignKey: 'project_id',
        as: 'bookings'
      });
    }
  }
  projects.init({
    project_name: DataTypes.STRING,
    project_type_id: DataTypes.INTEGER,
    project_status_id: DataTypes.INTEGER,
    launch_date: DataTypes.DATEONLY,
    possession_date: DataTypes.DATEONLY,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    area_locality: DataTypes.STRING,
    landmark: DataTypes.STRING,
    full_address: DataTypes.TEXT,
    pincode: DataTypes.STRING,
    rera_registration_number: DataTypes.STRING,
    rera_registration_date: DataTypes.DATEONLY,
    rera_expiry_date: DataTypes.DATEONLY,
    towers: DataTypes.INTEGER,
    units: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    amenities: DataTypes.JSON,
    project_flat_types: DataTypes.JSON,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'projects',
  });
  return projects;
};