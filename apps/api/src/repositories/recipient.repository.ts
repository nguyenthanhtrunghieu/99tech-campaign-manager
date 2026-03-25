import { Recipient } from '../models';
import { RecipientCreate } from '@99tech/shared';

export class RecipientRepository {
  async list(): Promise<Recipient[]> {
    return Recipient.findAll();
  }

  async create(data: RecipientCreate): Promise<Recipient> {
    return Recipient.create(data);
  }

  async findByEmail(email: string): Promise<Recipient | null> {
    return Recipient.findOne({ where: { email } });
  }
}
