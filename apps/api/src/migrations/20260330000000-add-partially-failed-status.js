'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`ALTER TYPE "enum_campaigns_status" ADD VALUE 'PARTIALLY_FAILED';`);
      } catch (err) {
        if (err.message && err.message.includes('already exists')) {
          console.log('ENUM value PARTIALLY_FAILED already exists.');
        } else {
          console.error('Migration Error:', err);
        }
      }
  },

  async down(queryInterface, Sequelize) {
    // Postgres does not cleanly support removing an ENUM value without a complex recreation.
    // In many real-world scenarios, `down` on adding an ENUM value is left as a no-op or requires full recreation of the type.
    console.log('Down migration for removing ENUM values is not natively supported by Postgres ALTER TYPE.');
  },
};
