'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class masters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  masters.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    master: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('Dropdown', 'Multiselect', 'Radio', 'Checkbox', 'Text', 'Date Range', 'Input', 'Number', 'Hyperlink', 'Date'),
      allowNull: true
    },
    status: DataTypes.INTEGER,
    ismandate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'masters',
  });
  return masters;
};