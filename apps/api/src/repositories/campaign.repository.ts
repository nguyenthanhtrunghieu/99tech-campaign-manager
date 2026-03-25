import { Campaign, Recipient, CampaignRecipient } from '../models';
import { CampaignCreate, CampaignUpdate, CampaignStatus } from '@99tech/shared';
import { Transaction } from 'sequelize';
import { sequelize } from '../db';
import { calculateProgress } from '../utils/stats.util';

export class CampaignRepository {
  async create(data: CampaignCreate & { createdBy: string }, recipientEmails?: string[]): Promise<Campaign> {
    return await sequelize.transaction(async (t: Transaction) => {
      const { recipientEmails: _, ...campaignData } = data;
      const campaign = await Campaign.create(campaignData, { transaction: t });

      if (recipientEmails && recipientEmails.length > 0) {
        // Upsert recipients in bulk — one query per chunk instead of N queries
        await Recipient.bulkCreate(
          recipientEmails.map((email) => ({ email })),
          { ignoreDuplicates: true, transaction: t }
        );

        // Fetch all recipient ids in a single query
        const recipients = await Recipient.findAll({
          where: { email: recipientEmails },
          transaction: t,
        });

        // Bulk-insert CampaignRecipient join rows in batches of 500 to avoid memory overflow
        const joinRows = recipients.map((r) => ({
          campaignId: campaign.id,
          recipientId: r.id,
        }));

        const CHUNK_SIZE = 500;
        for (let i = 0; i < joinRows.length; i += CHUNK_SIZE) {
          await CampaignRecipient.bulkCreate(joinRows.slice(i, i + CHUNK_SIZE), {
            ignoreDuplicates: true,
            transaction: t,
          });
        }
      }

      return campaign;
    });
  }

  async list(createdBy: string): Promise<Campaign[]> {
    return Campaign.findAll({ where: { createdBy } });
  }

  async findById(id: string, createdBy: string): Promise<Campaign | null> {
    return Campaign.findOne({ where: { id, createdBy } });
  }

  async update(id: string, createdBy: string, data: CampaignUpdate): Promise<[number]> {
    return Campaign.update(data, { where: { id, createdBy } });
  }

  async updateStatus(id: string, status: CampaignStatus): Promise<[number]> {
    return Campaign.update({ status }, { where: { id } });
  }

  async updateStatusAtomic(id: string, createdBy: string, fromStatus: CampaignStatus, toStatus: CampaignStatus): Promise<number> {
    const [affectedRows] = await Campaign.update(
      { status: toStatus },
      { 
        where: { 
          id, 
          createdBy, 
          status: fromStatus 
        } 
      }
    );
    return affectedRows;
  }

  async delete(id: string, createdBy: string): Promise<number> {
    return Campaign.destroy({ where: { id, createdBy } });
  }

  async getStatsByCampaignId(campaignId: string) {
    const stats = await CampaignRecipient.findAll({
      where: { campaignId },
      attributes: [
        [sequelize.literal('COUNT(*)'), 'total'],
        [
          sequelize.literal("COUNT(CASE WHEN status = 'SENT' THEN 1 END)"),
          'sent',
        ],
        [
          sequelize.literal("COUNT(CASE WHEN status = 'FAILED' THEN 1 END)"),
          'failed',
        ],
        [
          sequelize.literal("COUNT(CASE WHEN status = 'PENDING' THEN 1 END)"),
          'pending',
        ],
      ],
      raw: true,
    });

    const row = (stats[0] as any) || { total: 0, sent: 0, failed: 0, pending: 0 };
    const total = Number(row.total);
    const sent = Number(row.sent);
    const failed = Number(row.failed);
    return {
      total,
      sent,
      failed,
      pending: Number(row.pending),
      progress: calculateProgress(sent + failed, total),
    };
  }
}
