import { User } from './User';
import { Campaign } from './Campaign';
import { Recipient } from './Recipient';
import { CampaignRecipient } from './CampaignRecipient';

// Associations
User.hasMany(Campaign, { foreignKey: 'userId', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Campaign.belongsToMany(Recipient, {
  through: CampaignRecipient,
  foreignKey: 'campaignId',
  otherKey: 'recipientId',
  as: 'recipients',
});

Recipient.belongsToMany(Campaign, {
  through: CampaignRecipient,
  foreignKey: 'recipientId',
  otherKey: 'campaignId',
  as: 'campaigns',
});

// Join Table Associations
CampaignRecipient.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
CampaignRecipient.belongsTo(Recipient, { foreignKey: 'recipientId', as: 'recipient' });

export { User, Campaign, Recipient, CampaignRecipient };
