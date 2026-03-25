import { CampaignCreateSchema } from '@99tech/shared';

describe('CampaignCreateSchema', () => {
  it('should pass with valid data', () => {
    const validData = {
      name: 'Spring Sale',
      subject: '20% Off!',
      htmlContent: '<h1>Promo</h1>',
      recipientEmails: ['test1@example.com', 'test2@example.com']
    };
    const result = CampaignCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail with invalid email format', () => {
    const invalidData = {
      name: 'Spring Sale',
      subject: '20% Off!',
      htmlContent: '<h1>Promo</h1>',
      recipientEmails: ['invalid-email']
    };
    const result = CampaignCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email');
    }
  });

  it('should pass with empty recipient list (optional)', () => {
    const data = {
      name: 'Spring Sale',
      subject: '20% Off!',
      htmlContent: '<h1>Promo</h1>',
      recipientEmails: []
    };
    const result = CampaignCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
