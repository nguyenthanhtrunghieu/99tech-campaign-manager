'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_recipients', {
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'campaigns',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      recipient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'recipients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED'),
        allowNull: false,
        defaultValue: 'PENDING',
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

    // Composite unique index (campaign_id, recipient_id) — enforces no duplicate sends
    await queryInterface.addIndex('campaign_recipients', ['campaign_id', 'recipient_id'], { unique: true });
    // Index to efficiently query all recipients per campaign with a status filter
    await queryInterface.addIndex('campaign_recipients', ['campaign_id', 'status']);
    await queryInterface.addIndex('campaign_recipients', ['campaign_id']);
    await queryInterface.addIndex('campaign_recipients', ['recipient_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_recipients');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_campaign_recipients_status"');
  },
};
