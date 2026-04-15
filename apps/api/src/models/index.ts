import { User } from './User';
import { Campaign } from './Campaign';
import { Recipient } from './Recipient';
import { CampaignRecipient } from './CampaignRecipient';
import { RefreshToken } from './RefreshToken';

// Associations
User.hasMany(Campaign, { foreignKey: 'createdBy', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'createdBy', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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
Campaign.hasMany(CampaignRecipient, { foreignKey: 'campaignId', as: 'campaignRecipients', onDelete: 'CASCADE' });
CampaignRecipient.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign', onDelete: 'CASCADE' });
CampaignRecipient.belongsTo(Recipient, { foreignKey: 'recipientId', as: 'recipient' });

export { User, Campaign, Recipient, CampaignRecipient, RefreshToken };

