import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { UserRegister, UserLogin } from '@99tech/shared';
import { getJwtSecret } from '../middleware/authMiddleware';
import { signToken } from '../utils/auth.util';
import { RefreshToken } from '../models';

/** Secrets resolved once at module load — process exits if missing. */
const JWT_SECRET = getJwtSecret();

function getRefreshSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set. Aborting startup.');
  return secret;
}
const REFRESH_SECRET = getRefreshSecret();

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * AuthService
 * @desc Handles user registration, login, token refresh, and logout.
 *       Access tokens expire in 15m; refresh tokens expire in 7d and are
 *       persisted in the DB for rotation/invalidation.
 */
export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user.
   * @throws {Error} If a user with the given email already exists.
   */
  async register(data: UserRegister) {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.create({ ...data, password: hashedPassword });

    return { id: user.id, email: user.email };
  }

  /**
   * Issue a short-lived access token (15m) + long-lived refresh token (7d).
   * The refresh token is persisted in the DB for rotation validation.
   */
  async login(data: UserLogin) {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    return this._issueTokenPair(user.id, user.email);
  }

  /**
   * Rotate refresh token.
   * Verifies the token exists in DB and is cryptographically valid,
   * then deletes the old record and issues a fresh pair (rotation).
   * Presenting an old token triggers reuse detection (DB not found → 401).
   */
  async refresh(tokenFromCookie: string) {
    // Step 1: Check DB — reuse detection
    const record = await RefreshToken.findOne({ where: { token: tokenFromCookie } });
    if (!record) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Step 2: Verify JWT signature and expiry
    let payload: { userId: string; email: string };
    try {
      payload = jwt.verify(tokenFromCookie, REFRESH_SECRET) as { userId: string; email: string };
    } catch {
      // Expired or tampered — delete the stale DB record
      await record.destroy();
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Step 3: Rotate — delete old, issue new pair
    await record.destroy();
    return this._issueTokenPair(payload.userId, payload.email);
  }

  /**
   * Invalidate the given refresh token from the DB on logout.
   */
  async logout(tokenFromCookie: string | undefined) {
    if (tokenFromCookie) {
      await RefreshToken.destroy({ where: { token: tokenFromCookie } });
    }
  }

  /**
   * Internal: sign an access + refresh token pair and persist the refresh token.
   */
  private async _issueTokenPair(userId: string, email: string) {
    const accessToken = signToken({ userId, email }, JWT_SECRET, ACCESS_TOKEN_TTL);
    const refreshToken = signToken({ userId, email }, REFRESH_SECRET, REFRESH_TOKEN_TTL);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await RefreshToken.create({ token: refreshToken, userId, expiresAt });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email },
    };
  }
}
