import { INotificationStrategy } from './INotificationStrategy';
import { CampaignRecipientStatus } from '@99tech/shared';

export class NotificationService {
  constructor(private strategy: INotificationStrategy) {}

  async sendNotification(email: string, subject: string, content: string): Promise<CampaignRecipientStatus> {
    return this.strategy.send(email, subject, content);
  }
}
