'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'website_footer'
      },
      unsubscribedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index on email and status for fast lookups
    await queryInterface.addIndex('newsletter_subscriptions', ['email']);
    await queryInterface.addIndex('newsletter_subscriptions', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('newsletter_subscriptions');
  }
};
