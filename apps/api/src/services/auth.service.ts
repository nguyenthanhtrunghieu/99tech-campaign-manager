import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { UserRegister, UserLogin } from '@99tech/shared';
import { getJwtSecret } from '../middleware/authMiddleware';
import { signToken } from '../utils/auth.util';

/** JWT_SECRET resolved once at module load — process exits if missing. */
const JWT_SECRET = getJwtSecret();

/**
 * AuthService
 * @desc Handles user registration and login business logic.
 *       Passwords are hashed with bcrypt (cost 10) before persistence.
 *       JWTs are signed with HS256 and expire after 1 hour.
 */
export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user.
   * @throws {Error} If a user with the given email already exists.
   * @returns Sanitised user object (id, email) — password never returned.
   */
  async register(data: UserRegister) {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.create({
      ...data,
      password: hashedPassword,
    });

    return { id: user.id, email: user.email };
  }

  /**
   * Authenticate a user and issue a signed JWT.
   * @throws {Error} Generic "Invalid email or password" to avoid user enumeration.
   * @returns { token, user: { id, email } }
   */
  async login(data: UserLogin) {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = signToken(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      '1h'
    );

    return { token, user: { id: user.id, email: user.email } };
  }
}
