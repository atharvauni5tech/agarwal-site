'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class broker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      broker.hasMany(models.commissions, {
        foreignKey: 'broker_id',
        as: 'commissions'
      });
      // Fix 2.1: Complementary side of the users.belongsTo(broker) association
      broker.hasOne(models.users, {
        foreignKey: 'broker_id',
        as: 'user_account',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }
  broker.init({
    broker_name: DataTypes.STRING,
    company_name: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    alternate_mobile: DataTypes.STRING,
    email: DataTypes.STRING,
    pan_number: DataTypes.STRING,
    gst_number: DataTypes.STRING,
    rera_registration_number: DataTypes.STRING,
    address_line_1: DataTypes.STRING,
    address_line_2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pincode: DataTypes.STRING,
    email_verified: DataTypes.INTEGER,
    mobile_verified: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    approvedByAdmin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'broker',
  });
  return broker;
};