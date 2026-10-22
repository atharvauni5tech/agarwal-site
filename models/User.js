'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'createdBy',
        constraints: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      User.belongsTo(models.User, {
        as: 'updater',
        foreignKey: 'updatedBy',
        constraints: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.UserRefreshToken, {
        foreignKey: 'userId',
        as: 'refreshTokens'
      });
      User.hasMany(models.Blog, {
        foreignKey: 'createdBy',
        as: 'createdBlogs'
      });
      User.hasMany(models.Blog, {
        foreignKey: 'updatedBy',
        as: 'updatedBlogs'
      });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USER'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users'
    }
  );

  return User;
};
