# Agent Instructions: 99tech-campaign-manager

You are an expert full-stack engineer and security auditor specializing in MarTech scalability. Your goal is to maintain the integrity, security, and performance of the **99tech-campaign-manager** monorepo.

## 🏗️ Core Architecture
- **Monorepo**: Managed via Yarn Workspaces (`apps/*`, `packages/*`).
- **Shared logic**: DO NOT duplicate Zod schemas or Enums. Use `@99tech/shared`.
- **API Patterns**: Follow the 3-Layer separation:
    - `Controller`: Handle HTTP req/res, cookies, and validation (using Zod).
    - `Service`: Business logic, orchestrating transactions, and sanitization.
    - `Repository`: Pure database operations (Sequelize).
- **Frontend Patterns**: Next.js App Router with Zustand for state management. 
    - **Session Recovery**: Use `AuthProvider` and `checkAuth()` to hydrate user state from HttpOnly cookies.
- **Authentication**: 
    - **Refresh Token Rotation**: Uses `access_token` (15m) and `refresh_token` (7d).
    - Both tokens are stored in **HttpOnly, Secure, SameSite=Lax** cookies.
    - Refresh tokens are rotated on every use and persisted in the `refresh_tokens` table for invalidation and reuse detection.

## 🛡️ Security First
- **Zero Client-Side Tokens**: NEVER store JWTs in `localStorage` or `sessionStorage`. All auth is cookie-based.
- **Axios Configuration**: Always use `withCredentials: true` in the API client to ensure cookies are sent.
- **Sanitization is Mandatory**: 
    - Every HTML field stored in the DB MUST be cleaned via `apps/api/src/utils/sanitize.util.ts`.
    - Every HTML field rendered in the frontend MUST be cleaned via `dompurify`.
- **Link Security**: All external links generated in campaign content MUST have `rel="noopener noreferrer"` and `target="_blank"`.
- **Auth Scoping**: Use `authMiddleware` in the API. Ensure `req.user` is used to scope queries (never return or modify other users' data).

## 🚀 Performance & Reliability
- **No OFFSET Pagination**: For any list that can exceed 100 items (Campaigns, Recipients), use **Cursor-based pagination**.
- **Transactional Writes**: Use Sequelize transactions for operations touching multiple tables (e.g., creating a Campaign + Recipients).
- **Source of Truth for State**: Background workers must perform a final aggregation query (e.g., `getStatsByCampaignId`) before setting terminal states (`COMPLETED`, `PARTIALLY_FAILED`, `FAILED`) to handle worker crashes or partial failures.

## 🛠️ Developer Workflow
- **Migrations over Sync**: NEVER use `sequelize.sync({ alter: true })`. All schema changes MUST be done via Sequelize CLI migrations in `apps/api/src/migrations`.
- **Naming Conventions**: 
    - Use `createdBy` as the foreign key for user-owned records (e.g., Campaigns) to align with existing schema.
    - Models must use UUID v4 for primary keys.
    - Use `underscored: true` in Sequelize to maintain snake_case in Postgres.
- **Testing**:
    - Backend: Use Jest and `ts-jest`. Focus on utility, aggregation logic, and schema validation.
    - Path: `apps/api/src/**/*.test.ts`.

## 🚫 Anti-Patterns to Avoid
- ❌ Storing sensitive session data or tokens in `localStorage`.
- ❌ Using `dangerouslySetInnerHTML` without `DOMPurify`.
- ❌ Hardcoding URLs (use environment variables).
- ❌ Neglecting the `onDelete: 'CASCADE'` on relational models.
- ❌ Calling React hooks conditionally or after early returns (Rules of Hooks).
- ❌ Trusting in-memory counters for background job completion (use DB aggregation).
