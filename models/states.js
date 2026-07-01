'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class states extends Model {
    static associate(models) {
      states.hasMany(models.cities, {
        foreignKey: 'state_id',
        as: 'cities'
      });
    }
  }
  states.init({
    state_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'states',
  });
  return states;
};
