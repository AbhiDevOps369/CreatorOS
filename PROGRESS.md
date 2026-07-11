# PROGRESS.md — CreatorOS Frontend Build

> **If you are starting a new session: read this file first, then INSTRUCTIONS.txt, then skim Creator-OS-PRD.md.**
> The backend in `src/` is the source of truth wherever the PRD disagrees with it
> (the PRD is outdated in places — e.g. it lists 7 pipeline stages; the backend has 6).

## Ground truth (verified against backend code)

- Stages: `created → footage_collection → footage_review → editing → edit_review → delivered`
- `approve-edit` does NOT advance the stage — it sets `editApproved=true` and stays in `edit_review`.
  `deliver` (owner/manager, project-level route) requires `stage === "edit_review" && editApproved`.
- Only the **agency owner** can create projects (`requireAgencyOwner` on `POST /projects`) — the PRD's
  "manager creates → pending approval" flow is NOT in the backend; `approvalStatus` is always `approved`.
  Kept as-is per user instruction (backend logic wins).
- Clients CRUD is owner-gated too (`requireAgencyOwner`) except `GET /:clientId/projects` (owner/manager).
- Roles are per-project on Membership: `owner | manager | contributor | reviewer`. `jobTitle` on User is a label only.
- Response shape: `{ statusCode, data, message, success }` (ApiResponse). Errors now come back as the
  same JSON shape via the new error middleware.
- Auth: `POST /auth/login` returns `{ user, accessToken, refreshToken }` and also sets httpOnly cookies.
  `verifyJwt` accepts the cookie OR `Authorization: Bearer`. Refresh: `POST /auth/refresh-token`
  (reads cookie or body). Registration requires `name, email, password, jobTitle`.
- Client portal auth is separate: `POST /portal/login`, `GET /portal/current-client`, `verifyJwt("client")`.

## Phase log

### ✅ Phase 0 — Backend repairs (done, verified by booting server)
The user authorized fixing things only where the product "completely fails". Changes made:

1. **`verifyJwt` → `verifyJwt()`** in `membership.routes.js`, `notes.routes.js`, `subtask.routes.js`.
   Why: `verifyJwt` is a factory; passed bare, Express calls the factory as middleware, `next()` never
   runs, and every request to members/notes/subtasks hangs forever.
2. **Added JSON error-handler middleware** at the end of `src/app.js`.
   Why: without it every thrown `ApiError` became Express's default HTML 500 — the frontend could never
   see 401 (needed for the refresh interceptor) or 403/422 guard messages.
3. **Added client portal auth**: `POST /portal/login`, `POST /portal/logout`, `GET /portal/current-client`
   (portal.controller.js + portal.routes.js). Why: portal routes guard with `verifyJwt("client")` but no
   endpoint ever issued a client token — the portal was unusable.
4. **Added `GET /agencies/members`** (any authenticated agency member; returns `name email jobTitle`).
   Why: allocate-team / add-member take `userId`s but there was no way to list agency staff.
5. **`updateMemberRole` now scopes lookup to `{userId, projectId}`** (was `{userId}` only).
   Why: with per-project roles, the old query could mutate the user's membership on a *different* project.
6. **`.env`: `CORS_ORIGIN=*` → `http://localhost:5173`.** Why: wildcard origin + `credentials:true` is
   rejected by browsers; portal/staff cookies need a credentialed CORS setup.

Deliberately NOT changed: owner-only project creation, `approvalStatus` always-approved, the dead
`/:projectId/deliver` route inside task.routes.js (unreachable but harmless — frontend uses the
project-level deliver route).

### ✅ Phase 1 — Frontend foundation (done)
Scaffold `frontend/` (Vite + React), Tailwind (v4) with the warm editorial theme, fonts (Fraunces +
Inter), `api/api.js` axios instance + 401-refresh interceptor, `AuthContext`, route skeleton,
UI primitives (Button, Badge, Input, Skeleton, EmptyState), Layout (Sidebar/Navbar), roleUtils.

### ✅ Phase 2 — Auth + Onboarding (done)
Login, Register (incl. jobTitle), Onboarding (create agency / waiting-for-invite state).

### ✅ Phase 3 — Dashboard + Clients + Team (done)
Project cards (name, client, stage badge, my role), create-project modal (owner),
Clients page (owner: list/create), invite staff (owner).

### ✅ Phase 4 — Project Detail (done)
PipelineRoad + StageNode, members panel, allocate-team flow, role×stage-aware action bar
(deliver etc.), tasks list + create task.

### ✅ Phase 5 — Task Detail (done)
Attachments/deliverables, subtask checklist (gates submit-edit), notes feed + acknowledge,
submit/approve/reject controls per role×stage.

### ✅ Phase 6 — Client Portal (done)
PortalLogin (separate token space), PortalProjects list, PortalProject detail (stage + deliverables only).

### ✅ Phase 7 — Polish & verification pass (done)
Visual walkthrough completed with headless Chrome (playwright-core driving system Chrome against the
live dev servers, seeded with 4 staff + 1 client + 2 projects). Screenshots verified: login, dashboard,
project detail (mid-pipeline road with animated gate + delivered road), task detail (deliverables +
checklist), contributor view (role-aware controls hidden), portal login/home/project. Two fixes came
out of it:

7. **`src/index.js`: added `import 'dotenv/config'` as the first import.** Root cause: ESM imports are
   evaluated in order — `app.js` configured `cors({ origin: process.env.CORS_ORIGIN })` *before*
   `db/index.js` ran `dotenv.config()`, so the origin was `undefined`, cors fell back to `*`, and every
   credentialed browser request was CORS-blocked. Invisible to curl/Postman — that's why backend tests
   passed while the browser failed.
8. Frontend: crew-panel hover controls are now overlaid (absolutely positioned) instead of reserving
   row space, which was truncating member names for owners/managers.

## Decisions made

- Frontend lives in `frontend/` (repo root `src/` is the backend — INSTRUCTIONS' `src/` layout is applied *inside* `frontend/`).
- Tokens: in-memory (module-level in `api.js`) + httpOnly cookies as fallback; session restore on reload
  via `GET /auth/current-user` (cookie carries it — localhost:5173→3000 is same-site so Lax cookies flow).
  Never localStorage, per INSTRUCTIONS.
- Staff and portal auth are two separate contexts/tokens; portal pages never share components' auth state.
- Accent color: muted terracotta `#C4633F`. Headings: Fraunces. Body: Inter.
- Memberships API returns raw userIds → UI maps names via `GET /agencies/members`.

## Open questions

- Email flows (verify-email, invite accept) depend on Mailtrap SMTP creds in `.env` — invite-accept is a
  link clicked from email; the UI can only trigger the invite, not accept it. Acceptable for v1?
- `submit-footage`/`submit-edit` move the whole PROJECT stage on first task submit (stage is project-level);
  with several tasks the second submit in the same stage 422s. UI treats these as project-stage actions
  surfaced on tasks (matches backend). Worth confirming intent later.

## Verification so far

- `npm run build` in `frontend/` passes clean (Vite 8, 109 modules).
- **API-level E2E: 33/33 checks pass** (script exercised the real backend):
  registration ×4 → owner login → create agency → roster (`GET /agencies/members`) →
  create client → create project → allocate-team (3 crew) → submit-footage →
  reject-footage (back to footage_collection) → re-submit → approve-footage → subtask
  created by reviewer → submit-edit **422 while subtask open** → toggle → submit-edit →
  request-changes (back to editing only) → re-submit → deliver **422 before approve-edit** →
  approve-edit (`editApproved=true`, stays edit_review) → deliver → delivered →
  notes create/edit/acknowledge → 403s come back as JSON → portal login → portal list/detail
  (deliverables only, no internals) → staff token rejected on portal.
- **In-browser visual pass: done** (headless Chrome, 10 screenshots across staff owner/contributor
  views and the client portal; no unexpected console errors — the only 401/403 in the log are the
  intentional session-restore and owner-detection probes).

## How to run

1. Backend (repo root): `npm run dev` → http://localhost:3000
2. Frontend: `cd frontend && npm run dev` → http://localhost:5173
   (CORS is pinned to :5173 in `.env`.)

## Next

All seven phases are complete. Reasonable follow-ups if the project continues:
task status editing (backend has the enum but no endpoint mutates it), invite-accept UX that doesn't
depend on Mailtrap, dark mode (palette tokens are ready for a warm-charcoal variant), and the
"second submit in the same stage 422s" question under Open questions.
