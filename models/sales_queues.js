'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sales_queues extends Model {
    static associate(models) {
      sales_queues.belongsTo(models.users, { foreignKey: 'sales_executive_id', as: 'executive' });
      sales_queues.belongsTo(models.projects, { foreignKey: 'project_id', as: 'project' });
    }
  }
  sales_queues.init({
    sales_executive_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    is_present: DataTypes.BOOLEAN,
    is_available: DataTypes.BOOLEAN,
    on_leave: DataTypes.BOOLEAN,
    last_assigned_at: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sales_queues',
  });
  return sales_queues;
};
