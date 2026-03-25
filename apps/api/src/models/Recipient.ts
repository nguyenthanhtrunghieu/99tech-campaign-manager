import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class Recipient extends Model {
  declare id: string;
  declare email: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Recipient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Recipient',
  }
);
