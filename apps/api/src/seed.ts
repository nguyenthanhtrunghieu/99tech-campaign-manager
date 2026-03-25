import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });
import bcrypt from 'bcrypt';
import { sequelize } from './db';
import { User } from './models/User';
import { Campaign } from './models/Campaign';
import { Recipient } from './models/Recipient';
import { CampaignRecipient } from './models/CampaignRecipient';
import { CampaignStatus, CampaignRecipientStatus } from '@99tech/shared';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Create Test User
    const existingUser = await User.findOne({ where: { email: 'test@99tech.com' } });
    if (existingUser) {
      console.log('Test user already exists. Cleaning up old seed data...');
      await Campaign.destroy({ where: { createdBy: existingUser.id } });
      await existingUser.destroy();
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      email: 'test@99tech.com',
      password: hashedPassword,
    });
    console.log('Test user created.');

    // Helper to create recipients
    const createRecipients = async (count: number) => {
      const recipients = [];
      for (let i = 0; i < count; i++) {
        recipients.push({ email: `recipient_${Math.random().toString(36).slice(2)}@example.com` });
      }
      return await Recipient.bulkCreate(recipients, { ignoreDuplicates: true });
    };

    // 2. Campaign 1 (DRAFT) - 5 recipients
    const campaign1 = await Campaign.create({
      name: 'Spring Sale 2026',
      subject: 'Extra 20% off all items!',
      htmlContent: '<h1>Spring Sale!</h1><p>Use code SPRING20 at checkout.</p>',
      status: CampaignStatus.DRAFT,
      createdBy: user.id,
    });
    const recs1 = await createRecipients(5);
    await CampaignRecipient.bulkCreate(recs1.map(r => ({
      campaignId: campaign1.id,
      recipientId: r.id,
      status: CampaignRecipientStatus.PENDING
    })));
    console.log('Campaign 1 (DRAFT) created with 5 recipients.');

    // 3. Campaign 2 (COMPLETED) - 20 recipients mixed
    const campaign2 = await Campaign.create({
      name: 'Welcome Series',
      subject: 'Welcome to our newsletter',
      htmlContent: '<h1>Welcome!</h1><p>We are glad to have you here.</p>',
      status: CampaignStatus.COMPLETED,
      createdBy: user.id,
    });
    const recs2 = await createRecipients(20);
    await CampaignRecipient.bulkCreate(recs2.map((r, i) => ({
      campaignId: campaign2.id,
      recipientId: r.id,
      status: i % 4 === 0 ? CampaignRecipientStatus.FAILED : CampaignRecipientStatus.SENT
    })));
    console.log('Campaign 2 (COMPLETED) created with 20 mixed recipients.');

    // 4. Campaign 3 (DRAFT -> Ready for Sending) - 500 recipients
    const campaign3 = await Campaign.create({
      name: 'Large Blast',
      subject: 'Urgent Announcement',
      htmlContent: '<h1>Big News!</h1><p>This is a major update for all members.</p>',
      status: CampaignStatus.DRAFT,
      createdBy: user.id,
    });
    console.log('Generating 500 recipients for Large Blast...');
    const recs3 = await createRecipients(500);
    const chunks = [];
    const chunkSize = 100;
    for (let i = 0; i < recs3.length; i += chunkSize) {
      chunks.push(recs3.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      await CampaignRecipient.bulkCreate(chunk.map(r => ({
        campaignId: campaign3.id,
        recipientId: r.id,
        status: CampaignRecipientStatus.PENDING
      })));
    }
    console.log('Campaign 3 (DRAFT) created with 500 pending recipients.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
