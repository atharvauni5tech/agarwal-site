'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class visit_allocations extends Model {
    static associate(models) {
      visit_allocations.belongsTo(models.visits, { foreignKey: 'visit_id', as: 'visit' });
      visit_allocations.belongsTo(models.leads, { foreignKey: 'lead_id', as: 'lead' });
      visit_allocations.belongsTo(models.users, { foreignKey: 'sales_executive_id', as: 'salesExecutive' });
    }
  }
  visit_allocations.init({
    visit_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sales_executive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    override_by_manager: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'visit_allocations',
    tableName: 'visit_allocations'
  });
  return visit_allocations;
};
