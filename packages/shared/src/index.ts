import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum CampaignRecipientStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const CampaignCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  scheduledAt: z.coerce.date().optional(),
  recipientEmails: z.array(z.string().email()).optional(),
});

export const CampaignUpdateSchema = CampaignCreateSchema.partial().extend({
  status: z.nativeEnum(CampaignStatus).optional(),
});

export const RecipientCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const RecipientListSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
});

export const UserRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CampaignCreate = z.infer<typeof CampaignCreateSchema>;
export type CampaignUpdate = z.infer<typeof CampaignUpdateSchema>;
export type RecipientCreate = z.infer<typeof RecipientCreateSchema>;
export type RecipientList = z.infer<typeof RecipientListSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;

// ─── Response Types ───────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  status: CampaignStatus;
  scheduledAt: string | null; // From JSON
  createdBy: string;
  createdAt: string; // From JSON
  updatedAt: string; // From JSON
}

export interface CampaignStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  progress: number; // (sent + failed) / total * 100, 0 when total is 0
}

