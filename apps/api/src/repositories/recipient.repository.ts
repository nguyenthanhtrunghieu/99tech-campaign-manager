import { Recipient } from '../models';
import { RecipientCreate } from '@99tech/shared';
import { Op } from 'sequelize';

export class RecipientRepository {
  async list(cursor?: string, limit: number = 10): Promise<Recipient[]> {
    const where: any = {};
    if (cursor) {
      where.id = { [Op.lt]: cursor };
    }
    return Recipient.findAll({
      where,
      limit: limit + 1,
      order: [['id', 'DESC']]
    });
  }

  async create(data: RecipientCreate): Promise<Recipient> {
    return Recipient.create(data);
  }

  async findByEmail(email: string): Promise<Recipient | null> {
    return Recipient.findOne({ where: { email } });
  }
}
