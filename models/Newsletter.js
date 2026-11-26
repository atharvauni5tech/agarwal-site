'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Newsletter extends Model {
    static associate(models) {
      Newsletter.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      Newsletter.belongsTo(models.User, {
        foreignKey: 'updatedBy',
        as: 'updater',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }

  Newsletter.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subtitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageRedirectUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      htmlContent: {
        type: DataTypes.TEXT('long'),
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
      modelName: 'Newsletter',
      tableName: 'newsletters'
    }
  );

  return Newsletter;
};
