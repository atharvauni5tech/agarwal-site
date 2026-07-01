'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class commissionPlanTiers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      commissionPlanTiers.belongsTo(models.commissionPlans, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  commissionPlanTiers.init({
    planId: DataTypes.INTEGER,
    minBookings: DataTypes.INTEGER,
    maxBookings: DataTypes.INTEGER,
    percentage: DataTypes.DECIMAL(5, 2),
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'commissionPlanTiers',
  });
  return commissionPlanTiers;
};