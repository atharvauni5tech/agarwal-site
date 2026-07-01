'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class commissions extends Model {
    static associate(models) {
      commissions.belongsTo(models.bookings, { foreignKey: 'booking_id', as: 'booking' });
      commissions.belongsTo(models.broker, { foreignKey: 'broker_id', as: 'broker' });
    }
  }
  commissions.init({
    booking_id: DataTypes.INTEGER,
    broker_id: DataTypes.INTEGER,
    sale_value: DataTypes.DECIMAL(15, 2),
    broker_percentage: DataTypes.DECIMAL(5, 2),
    commission_amount: DataTypes.DECIMAL(15, 2),
    payout_status: DataTypes.STRING,
    approved_by: DataTypes.INTEGER,
    approved_at: DataTypes.DATE,
    paid_at: DataTypes.DATE,
    transaction_reference: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'commissions',
  });
  return commissions;
};
