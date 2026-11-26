'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NewsletterSubscription extends Model {
    static associate(models) {
      // Define associations here if needed in future
    }
  }

  NewsletterSubscription.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'website_footer'
      },
      unsubscribedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'NewsletterSubscription',
      tableName: 'newsletter_subscriptions'
    }
  );

  return NewsletterSubscription;
};
