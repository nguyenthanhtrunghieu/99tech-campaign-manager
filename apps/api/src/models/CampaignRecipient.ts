import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { CampaignRecipientStatus } from '@99tech/shared';

export class CampaignRecipient extends Model {
  declare campaignId: string;
  declare recipientId: string;
  declare status: CampaignRecipientStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CampaignRecipient.init(
  {
    campaignId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CampaignRecipientStatus)),
      defaultValue: CampaignRecipientStatus.PENDING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CampaignRecipient',
    indexes: [
      { unique: true, fields: ['campaign_id', 'recipient_id'] },
      { fields: ['campaign_id', 'status'] },
      { fields: ['campaign_id'] },
      { fields: ['recipient_id'] },
    ],
  }
);
