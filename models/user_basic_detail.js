'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_basic_detail extends Model {
    static associate(models) {
      user_basic_detail.belongsTo(models.users, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  user_basic_detail.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address_line_1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address_line_2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alternate_number: {
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
    modelName: 'user_basic_detail',
    tableName: 'user_basic_details'
  });
  return user_basic_detail;
};
