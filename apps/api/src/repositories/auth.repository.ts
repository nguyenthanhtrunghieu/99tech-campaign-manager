import { User } from '../models';
import { UserRegister } from '@99tech/shared';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async create(data: UserRegister): Promise<User> {
    return User.create(data);
  }
}
