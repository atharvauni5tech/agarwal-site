'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class commissionPlans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      commissionPlans.hasMany(models.commissionPlanTiers, {
        foreignKey: 'planId',
        as: 'tiers'
      });
      commissionPlans.hasMany(models.brokerCommissionPlans, {
        foreignKey: 'planId',
        as: 'brokerAssignments'
      });
    }
  }
  commissionPlans.init({
    planName: DataTypes.STRING,
    commissionType: DataTypes.ENUM('FLAT', 'TIERED'),
    basePercentage: DataTypes.DECIMAL(5, 2),
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1 // 1=Active, 0=Inactive, 2=Deleted
    },
    active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'commissionPlans',
  });
  return commissionPlans;
};