'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_otps extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_otps.init({
    user_id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    otp: DataTypes.INTEGER,
    type: DataTypes.STRING,
    expires_at: DataTypes.DATE,
    verified_at: DataTypes.DATE,
    status: DataTypes.INTEGER,
    attempt_count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_otps',
  });
  return user_otps;
};