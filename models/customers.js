'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      customers.belongsTo(models.broker, {
        foreignKey: 'broker_id',
        as: 'broker'
      });
      customers.hasMany(models.leads, {
        foreignKey: 'customer_id',
        as: 'leads'
      });
      customers.belongsTo(models.users, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  }
  customers.init({
    broker_id: DataTypes.INTEGER,
    customer_name: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    email: DataTypes.STRING,
    note: DataTypes.STRING,
    source: DataTypes.STRING,
    purpose: DataTypes.STRING,
    current_residence: DataTypes.STRING,
    purpose_of_buying: DataTypes.STRING,
    status: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    leadCreatorRole: DataTypes.STRING,
    referredByName: DataTypes.STRING,
    referredByMobileNumber: DataTypes.STRING,
    referredByEmail: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'customers',
  });
  return customers;
};