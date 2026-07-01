'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bookings extends Model {
    static associate(models) {
      bookings.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      bookings.belongsTo(models.projects, { foreignKey: 'project_id', as: 'project' });
      bookings.hasOne(models.commissions, { foreignKey: 'booking_id', as: 'commission' });
      bookings.belongsTo(models.users, { foreignKey: 'created_by', as: 'createdBy' });
    }
  }
  bookings.init({
    lead_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    unit_number: DataTypes.STRING,
    tower: DataTypes.STRING,
    floor: DataTypes.STRING,
    booking_amount: DataTypes.DECIMAL(15, 2),
    agreement_value: DataTypes.DECIMAL(15, 2),
    booking_date: DataTypes.DATE,
    status: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'bookings',
  });
  return bookings;
};
