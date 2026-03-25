import { INotificationStrategy } from './INotificationStrategy';
import { CampaignRecipientStatus } from '@99tech/shared';

export class MockEmailStrategy implements INotificationStrategy {
  async send(email: string, _subject: string, _content: string): Promise<CampaignRecipientStatus> {
    // Simulate 100ms delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Randomly return SENT (80%) or FAILED (20%)
    const isSuccess = Math.random() < 0.8;
    
    // Dev-only trace — remove when wiring a real email provider
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MockEmail] Sending to ${email}... ${isSuccess ? 'SUCCESS' : 'FAILED'}`);
    }
    
    return isSuccess ? CampaignRecipientStatus.SENT : CampaignRecipientStatus.FAILED;
  }
}
