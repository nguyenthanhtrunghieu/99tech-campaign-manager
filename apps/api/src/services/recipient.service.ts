import { RecipientRepository } from '../repositories/recipient.repository';
import { RecipientCreate } from '@99tech/shared';

/**
 * RecipientService
 * @desc Handles business logic for recipient management.
 *       Enforces email uniqueness before delegating persistence
 *       to RecipientRepository.
 */
export class RecipientService {
  private recipientRepository: RecipientRepository;

  constructor() {
    this.recipientRepository = new RecipientRepository();
  }

  /**
   * List all recipients.
   */
  async list() {
    return this.recipientRepository.list();
  }

  /**
   * Create a new recipient.
   * @throws {Error} If a recipient with the given email already exists.
   */
  async create(data: RecipientCreate) {
    const existing = await this.recipientRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Recipient with this email already exists');
    }
    return this.recipientRepository.create(data);
  }
}
