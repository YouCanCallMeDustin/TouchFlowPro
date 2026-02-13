# TouchFlow Pro Architecture

> **Purpose:** This document serves as the source of truth for the codebase structure, key patterns, and development guardrails.

## 1. Repo Overview

This is a Monorepo containing:
- `/backend`: Node.js + Express + Prisma (SQLite).
- `/frontend`: React 19 + Vite + Zustand + TailwindCSS.
- `/shared`: Shared Types & Business Logic (Symlinked/Copied).
- `/vscode-extension`: (Separate) VS Code Extension source.

## 2. Key Patterns

### Frontend Routing (Stage Router)
❌ **Do NOT introduce React Router.**
- The app uses a custom state-based router centered around the `stage` variable in `frontend/src/App.tsx`.
- Navigation happens by setting `setStage('dashboard')`, `setStage('lesson')`, etc.
- Layouts (Header/Footer) render conditionally based on the current stage.

### Authentication Flow
1. User logs in via `Login.tsx`.
2. `AuthContext` calls `/api/auth/login`.
3. Backend returns a JWT.
4. `AuthContext` saves JWT to `localStorage` ('tfp_token').
5. `apiFetch` utility automatically attaches this token to subsequent requests.
6. Backend `authenticateToken` middleware verifies the JWT and attaches `req.user`.

### Spaced Repetition (Core Engine)
- Logic resides in `shared/scheduler.ts` (SM-2 Algorithm variant).
- "Drills" are scheduled by the backend (`routes/drills.ts`) calling `SpacedScheduler`.
- Frontend receives the *result* (what to study next), it does not schedule itself.

### SQLite Safety Guardrails
⚠️ **CRITICAL: SQLite Write Locking**
- SQLite allows only **one writer at a time**.
- **Rule 1:** Keep write transactions Short.
- **Rule 2:** Avoid concurrent write-heavy background jobs.
- **Rule 3:** Use `prisma.$transaction` for atomic updates involving multiple tables.
- **Rule 4:** Do not run long-running analytics queries on the primary DB during peak traffic.

## 3. Where to Change What

| Feature | Frontend Location | Backend Location | Shared Logic |
| :--- | :--- | :--- | :--- |
| **Auth** | `context/AuthContext.tsx` | `routes/auth.ts`, `middleware/auth.ts` | `types.ts` |
| **Drills** | `components/LessonView.tsx` | `routes/drills.ts` | `scheduler.ts`, `drillLibrary.ts` |
| **Games** | `games/<game-name>/` | `routes/sessions.ts` | `typingEngine.ts` |
| **Stats** | `components/Analytics.tsx` | `routes/analytics.ts` | `analytics.ts` |
| **Organizations** | `pages/Orgs.tsx` | `routes/orgs.ts`, `routes/orgInvites.ts` | `types.ts` (Prisma) |

## 4. Development Quality Gates

### Standardized Error Handling
- **Backend:** All errors must return `{ "error": { "code": string, "message": string } }`
- **Frontend:** `apiFetch` in `utils/api.ts` handles this shape globally.

### Input Validation
- All backend write endpoints (`POST`, `PUT`) MUST use `zod` schemas defined in `backend/src/lib/validation.ts`.

### Smoke Test Checklist
Before committing, verify:
1. [ ] App builds (`npm run build`).
2. [ ] Login/Logout works.
3. [ ] A Drill session can be started and completed.
4. [ ] Dashboard loads without 500s.
5. [ ] Organization creation and invite flow works.

## 5. UI Design System

### Design Tokens (CSS Variables)
- **Source of Truth:** `frontend/src/index.css`.
- **Naming Convention:** `--token-name` (e.g. `--bg`, `--surface`, `--primary`).
- **Core Tokens:**
  - `bg`, `surface`: Backgrounds.
  - `text`, `text-muted`: Typography.
  - `primary`, `secondary`, `accent`, `danger`: Brand colors.
  - `border`, `radius`, `focus`: Utilities.

### Core Components
- **Location:** `frontend/src/components/ui/`.
- **Philosophy:** Reusable, accessible, and style-consistent wrappers using Tailwind CSS.
- **Components:**
  - `Button`: Primary, secondary, ghost, danger, outline variants. Supports loading state.
  - `Input`: Standardized text input with label, error, and icon support.
  - `Card`: Layout container with `glass` option for glassmorphism.

### Styling Guidelines
- Use Tailwind utility classes whenever possible.
- Use `var(--token)` for colors to ensure Dark Mode compatibility.
- Use the `cn()` utility in `frontend/src/lib/utils.ts` for conditional class merging.
- **Glassmorphism:** Use `glass` prop on `Card` or `.glass-panel` class for the signature look.

## 6. Organization Module Architecture

### Data Model
- **Organization**: Core entity (id, name, createdAt).
- **OrgMember**: Mapping user to org with a role (OWNER, ADMIN, MANAGER, MEMBER).
- **OrgInvite**: Temporary token-based invitation (email, role, expiresAt).

### Permissions Matrix

| Action | OWNER | ADMIN | MANAGER | MEMBER |
| :--- | :---: | :---: | :---: | :---: |
| View Org Details | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ❌ |
| Invite Users | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅ | ❌ | ❌ |
| Revoke Invites | ✅ | ✅ | ❌ | ❌ |
| Leave Org | ❌ | ✅ | ✅ | ✅ |
| Delete Org | ✅ | ❌ | ❌ | ❌ |

### Invite Flow
1. **Create Invite (Owner/Admin):** calls `/api/orgs/:orgId/invites` -> generates secure token -> returns token (copied to clipboard).
2. **Share Link:** `?token=...` (or manual code entry).
3. **Accept Invite (User):** calls `/api/org-invites/accept` with token -> verifies expiry -> creates `OrgMember` -> invalidates invite.

## 7. Subscription & Authorization

### Plan Tiers
- **FREE**: 5 Seats. Basic Dashboard.
- **PRO**: 20 Seats. Enterprise Reports.
- **ENTERPRISE**: 100 Seats. Custom Features.

### Enforcement
- **Seat Limits**: Checked during `Invite Creation` and `Invite Acceptance`.
    - Error Code: `SEAT_LIMIT_REACHED`.
- **Feature Gating**: Endpoints check `org.planTier`.
    - Error Code: `PLAN_UPGRADE_REQUIRED` (e.g., Weekly Reports).

### Management
- **Stripe Billing Integration** (Phase 11):
    - **Upgrade Flow:** Owners click "Upgrade" -> Redirect to Stripe Checkout -> Webhook updates `planTier`.
    - **Portal:** Owners manage billing (cancel, update method) via Stripe Billing Portal.
    - **Status:** Syncs `planStatus` (active, past_due, canceled).
    - **Downgrades:** If subscription cancels, Org reverts to FREE (5 seats). Enforced immediately.
