import { Router, Request, Response } from 'express';
import { RecipientService } from '../services/recipient.service';
import { validateRequest } from '../middleware/validateRequest';
import { RecipientCreateSchema } from '@99tech/shared';
import { authMiddleware } from '../middleware/authMiddleware';

export const recipientRouter = Router();
const recipientService = new RecipientService();

/** All recipient routes require a valid Bearer JWT. */
recipientRouter.use(authMiddleware);

/**
 * GET /recipients
 * @desc    List all recipients in the system.
 * @access  Private
 * @returns 200 Recipient[] | 500 { message }
 */
recipientRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const recipients = await recipientService.list();
    res.json(recipients);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /recipients
 * @desc    Create a new recipient. Returns 400 if the email is already registered.
 * @access  Private
 * @body    { email } — validated against RecipientCreateSchema
 * @returns 201 Recipient | 400 { message }
 */
recipientRouter.post('/', validateRequest(RecipientCreateSchema), async (req: Request, res: Response) => {
  try {
    const recipient = await recipientService.create(req.body);
    res.status(201).json(recipient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
