'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cities extends Model {
    static associate(models) {
      cities.belongsTo(models.states, {
        foreignKey: 'state_id',
        as: 'state'
      });
    }
  }
  cities.init({
    city_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'cities',
  });
  return cities;
};
