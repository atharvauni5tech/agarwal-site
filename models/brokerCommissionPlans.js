'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class brokerCommissionPlans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      brokerCommissionPlans.belongsTo(models.broker, {
        foreignKey: 'brokerId',
        as: 'broker'
      });
      brokerCommissionPlans.belongsTo(models.commissionPlans, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  brokerCommissionPlans.init({
    brokerId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    assignedBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'brokerCommissionPlans',
  });
  return brokerCommissionPlans;
};