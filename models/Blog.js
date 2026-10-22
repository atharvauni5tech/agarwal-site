'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    static associate(models) {
      Blog.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      Blog.belongsTo(models.User, {
        foreignKey: 'updatedBy',
        as: 'updater',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }

  Blog.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blogCategory: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blogSummary: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      blogDescription: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      blogImageFileName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      blogImageURL: {
        type: DataTypes.TEXT,
        allowNull: true
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
      modelName: 'Blog',
      tableName: 'blogs'
    }
  );

  return Blog;
};
