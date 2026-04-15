import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignCreate, CampaignUpdate, CampaignStatus, CampaignRecipientStatus } from '@99tech/shared';
import { NotificationService } from './notifications/NotificationService';
import { MockEmailStrategy } from './notifications/MockEmailStrategy';
import { CampaignRecipient } from '../models';
import { sanitizeHtmlContent } from '../utils/sanitize.util';

/**
 * CampaignService
 * @desc Orchestrates all campaign business logic.
 *       Enforces ownership, status-transition rules, and delegates
 *       data access exclusively to CampaignRepository.
 */
export class CampaignService {
  private campaignRepository: CampaignRepository;
  private notificationService: NotificationService;

  constructor() {
    this.campaignRepository = new CampaignRepository();
    this.notificationService = new NotificationService(new MockEmailStrategy());
  }

  /**
   * Create a new campaign in DRAFT status.
   * Recipients are upserted and linked atomically inside a DB transaction.
   */
  async create(data: CampaignCreate, createdBy: string) {
    const sanitizedData = {
      ...data,
      htmlContent: sanitizeHtmlContent(data.htmlContent)
    };
    return this.campaignRepository.create({ ...sanitizedData, createdBy }, data.recipientEmails);
  }

  /**
   * List all campaigns owned by the given user.
   */
  async list(createdBy: string, cursor?: string, limit: number = 10) {
    const campaigns = await this.campaignRepository.list(createdBy, cursor, limit);
    const hasNextPage = campaigns.length > limit;
    const data = hasNextPage ? campaigns.slice(0, limit) : campaigns;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;

    return {
      data,
      nextCursor,
      hasNextPage
    };
  }

  /**
   * Fetch a single campaign by ID, scoped to the owner.
   * @throws {Error} 'Campaign not found' if the ID does not exist or belongs to another user.
   */
  async findById(id: string, createdBy: string) {
    const campaign = await this.campaignRepository.findById(id, createdBy);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  }

  /**
   * Update a campaign's fields.
   * @throws {Error} If the campaign is not in DRAFT status.
   */
  async update(id: string, createdBy: string, data: CampaignUpdate) {
    const campaign = await this.findById(id, createdBy);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new Error('Only draft campaigns can be updated');
    }

    const sanitizedData = {
      ...data,
      htmlContent: data.htmlContent ? sanitizeHtmlContent(data.htmlContent) : data.htmlContent
    };

    return this.campaignRepository.update(id, createdBy, sanitizedData);
  }

  /**
   * Delete a campaign.
   * @throws {Error} If the campaign is not in DRAFT status.
   */
  async delete(id: string, createdBy: string) {
    const campaign = await this.findById(id, createdBy);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new Error('Only draft campaigns can be deleted');
    }

    return this.campaignRepository.delete(id, createdBy);
  }

  /**
   * Initiate campaign delivery.
   * Uses an atomic compare-and-swap (DRAFT → SENDING) to prevent duplicate sends
   * under concurrent requests. The background worker is dispatched non-blocking
   * via setImmediate so the HTTP response returns 202 immediately.
   * @throws {Error} If the campaign is not DRAFT, not found, or not owned by the user.
   */
  async sendCampaign(id: string, createdBy: string) {
    const affectedRows = await this.campaignRepository.updateStatusAtomic(
      id,
      createdBy,
      CampaignStatus.DRAFT,
      CampaignStatus.SENDING
    );

    if (affectedRows === 0) {
      throw new Error('Campaign cannot be initiated. It may already be sending or does not exist.');
    }

    setImmediate(() => {
      this.backgroundSendWorker(id)
        .catch(err => console.error(`[BackgroundSendWorker] Error for campaign ${id}:`, err));
    });

    return { message: 'Campaign sending initiated' };
  }

  /**
   * Background worker that iterates all CampaignRecipients and dispatches
   * notifications via the injected NotificationService strategy.
   * Per-recipient failures are caught individually so one bad address
   * does not abort the entire send. Final campaign status is set to
   * COMPLETED or FAILED based on overall outcome.
   */
  private async backgroundSendWorker(campaignId: string) {
    try {
      const rows = await CampaignRecipient.findAll({
        where: { campaignId },
        include: ['recipient', 'campaign'],
      });

      for (const row of rows as any) {
        try {
          const status = await this.notificationService.sendNotification(
            row.recipient.email,
            row.campaign.subject,
            row.campaign.htmlContent
          );
          await row.update({ status });
        } catch (err) {
          console.error(`[BackgroundSendWorker] Individual send failure for recipient ${row.recipientId}:`, err);
          await row.update({ status: CampaignRecipientStatus.FAILED });
        }
      }

      // Source of Truth Check: aggregate final state from the DB
      const stats = await this.campaignRepository.getStatsByCampaignId(campaignId);
      
      let finalStatus = CampaignStatus.COMPLETED;
      const hasUnsuccessful = stats.failed > 0 || stats.pending > 0;
      
      if (hasUnsuccessful && stats.sent > 0) {
        finalStatus = CampaignStatus.PARTIALLY_FAILED;
      } else if (hasUnsuccessful && stats.sent === 0) {
        finalStatus = CampaignStatus.FAILED;
      }

      await this.campaignRepository.updateStatus(campaignId, finalStatus);
    } catch (err) {
      console.error(`[BackgroundSendWorker] Critical worker failure for campaign ${campaignId}:`, err);
      await this.campaignRepository.updateStatus(campaignId, CampaignStatus.FAILED);
    }
  }

  /**
   * Return aggregate delivery stats for a campaign.
   * Ownership is verified before querying stats.
   */
  async getStats(id: string, createdBy: string) {
    await this.findById(id, createdBy);
    return this.campaignRepository.getStatsByCampaignId(id);
  }
}
