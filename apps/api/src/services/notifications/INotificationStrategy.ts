import { CampaignRecipientStatus } from '@99tech/shared';

export interface INotificationStrategy {
  send(email: string, subject: string, content: string): Promise<CampaignRecipientStatus>;
}
