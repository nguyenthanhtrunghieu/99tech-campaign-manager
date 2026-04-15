'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      html_content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('campaigns', ['status', 'created_by']);
    await queryInterface.addIndex('campaigns', ['created_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaigns');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_campaigns_status"');
  },
};
