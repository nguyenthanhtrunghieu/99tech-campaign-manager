import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { CampaignStatus } from '@99tech/shared';

export class Campaign extends Model {
  declare id: string;
  declare name: string;
  declare subject: string;
  declare htmlContent: string;
  declare status: CampaignStatus;
  declare scheduledAt: Date | null;
  declare createdBy: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CampaignStatus)),
      defaultValue: CampaignStatus.DRAFT,
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Campaign',
    indexes: [
      { fields: ['status', 'created_by'] },
      { fields: ['created_by'] },
    ],
  }
);
