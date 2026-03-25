import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/validateRequest';
import { UserRegisterSchema, UserLoginSchema } from '@99tech/shared';

export const authRouter = Router();
const authService = new AuthService();

/**
 * POST /auth/register
 * @desc    Register a new user account.
 * @access  Public
 * @body    { name, email, password } — validated against UserRegisterSchema
 * @returns 201 { id, email } on success | 400 { message } on duplicate email or validation failure
 */
authRouter.post('/register', validateRequest(UserRegisterSchema), async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 * @desc    Authenticate a user and return a signed JWT (1h expiry).
 * @access  Public
 * @body    { email, password } — validated against UserLoginSchema
 * @returns 200 { token, user: { id, email } } on success | 401 { message } on invalid credentials
 */
authRouter.post('/login', validateRequest(UserLoginSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});
