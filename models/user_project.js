'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_project extends Model {
    static associate(models) {
      user_project.belongsTo(models.users, {
        foreignKey: 'user_id',
        as: 'user'
      });
      user_project.belongsTo(models.projects, {
        foreignKey: 'project_id',
        as: 'project'
      });
    }
  }
  user_project.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'user_project',
    tableName: 'user_projects'
  });
  return user_project;
};
