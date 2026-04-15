- Role: Senior Architect & Security Auditor.
- Checklist:
    - **Database**: Are UUIDs implemented correctly? Are there indexes on status and campaign_id?
    - **Data Integrity**: Is `onDelete: 'CASCADE'` applied to `Campaign` -> `CampaignRecipient` associations? 
    - **Pagination**: Are List APIs (Campaigns/Recipients) using **Cursor-based pagination** (keyset) instead of `OFFSET`?
    - **Security (XSS)**: Is `htmlContent` sanitized via `sanitize.util.ts` in the API service? Is `dompurify` used for frontend rendering?
    - **Security (Links)**: Do all external links in campaign content include `target="_blank"` and `rel="noopener noreferrer"`?
    - **Type Safety**: Are Zod schemas in `packages/shared` correctly linked to both `web` and `api`?
    - **Architecture**: Does the folder structure strictly follow the 3-layer separation (Controllers vs. Services vs. Repositories)?

---

## Architecture Decisions

### 3-Layer Separation (Verified ✓)
- `controllers/` — HTTP only (request/response).
- `services/` — Business logic (includes Strategy pattern under `services/notifications/`).
- `repositories/` — DB queries only.
- `models/` — ORM entity definitions (Sequelize).
- `middleware/` — Cross-cutting HTTP concerns (Auth, Rate Limit, Validation).
- `utils/` — Pure stateless helpers.

### @99tech/shared Package (Justified ✓)
Monorepo shared package at `packages/shared/src/index.ts` is mandatory.
It provides: Zod schemas (API/Frontend validation), shared enums (`CampaignStatus`), and response interfaces.

### Security Implementation (Added 2026-03-26)
- **Auth Rate Limiting**: `express-rate-limit` applied to `POST /auth/login` and `/auth/register` (5 requests/15 min).
- **Stored XSS Prevention**: `sanitize-html` utility in `apps/api/src/utils/sanitize.util.ts`.
- **Tabnabbing Prevention**: Mandatory `rel="noopener noreferrer"` on all `<a>` tags via `sanitize-html` transformation.
- **Client-side Sanitization**: `dompurify` in `apps/web` for any `dangerouslySetInnerHTML`.

### Database Migrations (Standardized 2026-03-29)
- **CLI Migrations**: `sequelize.sync()` has been removed. Schema is managed exclusively via Sequelize CLI migrations in `apps/api/src/migrations/`.
- **Config**: `apps/api/.sequelizerc` points to `src/config/database.js` (reads `.env`), `src/migrations/`, and `src/seeders/`.
- **Run**: `yarn workspace @99tech/api db:migrate` (or root alias `yarn db:migrate`).
- **Undo**: `yarn workspace @99tech/api db:migrate:undo`.
- **Order**: migrations execute in filename order — always add new tables after their FK dependencies.

### Performance (Standardized)
- **Cursor-based Pagination**: Applied to all high-volume list endpoints. Response format: `{ data: [], nextCursor: string | null, hasNextPage: boolean }`.
- **Query Optimization**: Database uses `WHERE id < :cursor LIMIT :limit` to avoid deep scan performance degradation.