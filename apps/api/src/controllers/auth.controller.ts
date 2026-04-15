import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/validateRequest';
import { authRateLimiter } from '../middleware/authRateLimiter';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { UserRegisterSchema, UserLoginSchema } from '@99tech/shared';

export const authRouter = Router();
const authService = new AuthService();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** Shared cookie options factory */
function cookieOpts(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax' as const,
    maxAge: maxAgeMs,
  };
}

const ACCESS_TOKEN_MAX_AGE  = 15 * 60 * 1000;        // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token',  accessToken,  cookieOpts(ACCESS_TOKEN_MAX_AGE));
  res.cookie('refresh_token', refreshToken, cookieOpts(REFRESH_TOKEN_MAX_AGE));
}

function clearTokenCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  // Also clear the old single cookie for sessions migrating from the previous version
  res.clearCookie('auth_token');
}

/**
 * POST /auth/register
 */
authRouter.post('/register', authRateLimiter, validateRequest(UserRegisterSchema), async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 * Issues access_token (15m) + refresh_token (7d) as HttpOnly cookies.
 */
authRouter.post('/login', authRateLimiter, validateRequest(UserLoginSchema), async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /auth/refresh
 * Validates and rotates the refresh token. Issues a new token pair.
 */
authRouter.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(refreshToken);
    setTokenCookies(res, accessToken, newRefreshToken);
    res.json({ user });
  } catch {
    clearTokenCookies(res);
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
});

/**
 * GET /auth/me
 * Returns the current user from the access_token cookie.
 */
authRouter.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

/**
 * POST /auth/logout
 * Invalidates the refresh token in the DB and clears both cookies.
 */
authRouter.post('/logout', async (req: Request, res: Response) => {
  await authService.logout(req.cookies.refresh_token);
  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
});
