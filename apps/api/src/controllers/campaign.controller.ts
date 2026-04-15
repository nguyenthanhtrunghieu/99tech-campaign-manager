import { Router, Response } from 'express';
import { CampaignService } from '../services/campaign.service';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { CampaignCreateSchema, CampaignUpdateSchema } from '@99tech/shared';

export const campaignRouter = Router();
const campaignService = new CampaignService();

/** All campaign routes require a valid Bearer JWT. */
campaignRouter.use(authMiddleware);

/**
 * POST /campaigns
 * @desc    Create a new campaign in DRAFT status, optionally with a recipient list.
 * @access  Private
 * @body    { name, subject, htmlContent, scheduledAt?, recipientEmails? }
 * @returns 201 Campaign | 400 { message }
 */
campaignRouter.post('/', validateRequest(CampaignCreateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await campaignService.create(req.body, req.user!.id);
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /campaigns
 * @desc    List all campaigns owned by the authenticated user.
 * @access  Private
 * @returns 200 Campaign[] | 500 { message }
 */
campaignRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await campaignService.list(req.user!.id, cursor, limit);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /campaigns/:id
 * @desc    Fetch a single campaign by ID. Ownership is enforced.
 * @access  Private
 * @returns 200 Campaign | 404 { message }
 */
campaignRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await campaignService.findById(req.params.id, req.user!.id);
    res.json(campaign);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * PATCH /campaigns/:id
 * @desc    Update a campaign. Only permitted when status is DRAFT.
 * @access  Private
 * @body    Partial<{ name, subject, htmlContent, scheduledAt, status }>
 * @returns 200 { message } | 400 { message }
 */
campaignRouter.patch('/:id', validateRequest(CampaignUpdateSchema), async (req: AuthRequest, res: Response) => {
  try {
    await campaignService.update(req.params.id, req.user!.id, req.body);
    res.json({ message: 'Campaign updated successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /campaigns/:id
 * @desc    Delete a campaign. Only permitted when status is DRAFT.
 * @access  Private
 * @returns 200 { message } | 400 { message }
 */
campaignRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await campaignService.delete(req.params.id, req.user!.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /campaigns/:id/send
 * @desc    Atomically transition a DRAFT campaign to SENDING and dispatch
 *          the background delivery worker. Returns immediately with 202.
 * @access  Private
 * @returns 202 { message } | 400 { message }
 */
campaignRouter.post('/:id/send', async (req: AuthRequest, res: Response) => {
  try {
    const result = await campaignService.sendCampaign(req.params.id, req.user!.id);
    res.status(202).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /campaigns/:id/stats
 * @desc    Return aggregate delivery stats (total, sent, failed, pending)
 *          calculated via SQL COUNT from the CampaignRecipients table.
 * @access  Private
 * @returns 200 { total, sent, failed, pending } | 400 { message }
 */
campaignRouter.get('/:id/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await campaignService.getStats(req.params.id, req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
