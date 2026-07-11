# BUILD_ORDER.md — how this frontend was built, and why in this order

This is the frontend twin of how the backend was built. The backend went
**models → middleware → controllers → routes** because each layer consumes the one
before it: middleware reads models, controllers assume guarded requests, routes just
wire controllers up. A frontend has the same physics — you build the things that are
*imported* before the things that *import them*. If you build a page first, you
immediately hit "I need an HTTP client, an auth state, a button" and end up inventing
those inline, three different ways, in three different pages.

Here is the order, with the dependency reasoning at each step.

---

## Step 0 — The frame: `index.html`, `vite.config.js`, `src/index.css`, `src/main.jsx`

**Why first:** nothing renders without a mount point and a build pipeline. This is the
equivalent of the backend's `app.js` + `db/index.js` — pure setup, no product logic.

- `index.html` loads the fonts (Fraunces for display, Inter for UI). Fonts are here and
  not in CSS `@import` so the browser starts fetching them before the JS bundle parses.
- `index.css` holds the **entire design system** as Tailwind theme tokens: the bone/ink/
  clay palette, shadows, and every animation keyframe. Defining tokens *before any
  component exists* is what keeps 20 components visually consistent later — components
  reference `bg-clay-500`, never a hex value.
- `main.jsx` mounts `<BrowserRouter>`. Router context must exist above anything that
  calls `useNavigate`/`Link` — which is almost everything.

## Step 1 — The HTTP spine: `src/api/api.js`

**Why before any page:** every page fetches. If pages create their own axios calls,
there is no single place to attach the auth header or handle 401s, and the refresh
logic gets copy-pasted or forgotten.

`api.js` owns three invariants for the whole app:

1. **One base URL** (`http://localhost:3000/api/v1`) — change environments in one line.
2. **Tokens in memory, attached in one request interceptor.** No component ever
   touches a token. (Never localStorage — XSS-readable.)
3. **The 401 dance in one response interceptor:** try `POST /auth/refresh-token` once,
   replay the original request, and if refresh fails, broadcast `auth:expired` so the
   auth context can log the user out. A `refreshPromise` latch dedupes concurrent 401s
   so five parallel requests trigger one refresh, not five.

It also exports a *second* axios instance, `portalApi`, with its own token. Staff and
client auth are different trust domains on the backend (`verifyJwt()` vs
`verifyJwt("client")`); giving them separate instances makes it *structurally
impossible* to accidentally send a staff token to a portal route from shared code.

## Step 2 — Pure logic: `src/utils/roleUtils.js`

**Why now:** it imports nothing (not even React), but the pipeline components, the
action buttons, and the pages all import *it*. Zero-dependency modules go early —
they can never block on anything, and everything can build on them.

It mirrors the backend's transition map verbatim: which role may do which action from
which stage. The backend *enforces*; this map only decides what to **show**. Because
it is one lookup table (not `if` statements scattered across pages), the UI can answer
"should this button exist?" with one call: `canDo("approve-footage", role, stage)`.

## Step 3 — Auth state: `src/context/AuthContext.jsx` (+ `PortalAuthContext.jsx`)

**Why before pages, after api.js:** the context *uses* `api.js` (login/logout/
current-user calls), and every page *uses* the context (who am I? am I signed in?).
That ordering is forced: api → context → pages.

Why context and not props: the signed-in user is needed by the sidebar, the guards,
the dashboard greeting, and every role check. Threading it through props would couple
every intermediate component to auth. Context makes "who is signed in" ambient, the
way `req.user` is ambient after the backend's `verifyJwt`.

On mount it calls `GET /auth/current-user` — the httpOnly cookie set at login is what
lets a hard reload restore the session without storing tokens anywhere readable.

## Step 4 — The UI kit: `src/components/UI/` (Button, Badge, Input, Modal, Skeleton, EmptyState)

**Why before any page:** pages are *assembled from* these. Build Button once and the
"loading spinner inside a disabled button" behavior exists everywhere; build it inside
a page and you'll rebuild it five times, slightly differently. This is also where the
design language physically lives — warm surfaces, hairline borders, 200ms transitions —
so pages inherit the aesthetic instead of re-implementing it.

`Badge` is worth a note: `StageBadge` and `RoleBadge` encode the *vocabulary* of the
domain (stages are warm-toned progress, roles are authority markers). Once they exist,
every page that says "where is this project / who are you here" says it identically.

## Step 5 — Chrome: `src/components/Layout/` (Sidebar, Navbar, AppLayout)

**Why after AuthContext and the kit:** the Sidebar shows the signed-in user and a
logout button (needs the context), styled with the kit's conventions. `AppLayout` is a
router `<Outlet>` wrapper, so every authed page gets navigation for free and pages own
only their content — same idea as Express routers mounting under one prefix.

## Step 6 — Domain components: `src/components/Pipeline/`, then `Task/`, `Project/`

**Why pipeline before ProjectDetail:** ProjectDetail *is mostly* the pipeline road; if
the road isn't a standalone component, it gets welded into the page and can't be reused
by the client portal — which renders the exact same road, read-only. Building
`PipelineRoad`/`StageNode` first, driven only by `(stage, editApproved)` props and
`roleUtils`, is what let the portal reuse it for free later.

`TaskActions` is the concentrated version of the whole product: it takes
`(role, stage, editApproved, incompleteSubtasks)` and renders only the legal moves —
one component, conditional rendering, **never** separate pages per role. `MembersPanel`,
`NotesPanel`, `AllocateTeamModal` are split out so ProjectDetail stays a composition
root instead of an 800-line page.

## Step 7 — Routing & guards: `src/App.jsx`

**Why now and not earlier:** guards need the contexts (Step 3); the route table needs
the layout (Step 5) and at least stub pages to point at. `RequireStaff`,
`RequireOnboarding`, `GuestOnly`, and `RequireClient` express the access model in the
route tree itself — a signed-out user *cannot reach* the dashboard, a user without an
agency is *always* routed to onboarding, portal routes live under their own provider.
Structural, not sprinkled `if`s — the same reason the backend keeps portal routes in a
separate router.

## Step 8 — Pages, in usage order

Pages come last because they are pure assembly: kit + contexts + domain components +
api calls. Within pages, follow the user's own journey, so every page is testable the
moment it's written:

1. **Login / Register** — you can't see anything else without a session.
2. **Onboarding (CreateAgency)** — a fresh user's forced first stop (`agencyId: null`).
3. **Dashboard + Clients + Team** — the owner's setup loop: add a client, invite crew,
   start a project. (Without a client, projects can't exist; without crew, they can't move.)
4. **ProjectDetail** — the centerpiece; needs projects to exist first.
5. **TaskDetail** — needs a project page to navigate from.
6. **Portal** — needs delivered work to be worth looking at; reuses the road and kit.

Build pages in this order and at every step the app *runs* and the next page has real
data to render. Build them in any other order and you're staring at empty states you
can't fill.

---

## The one-line summary

**Tokens → spine → logic → kit → chrome → domain pieces → routes → pages.**
Everything is built before the first thing that imports it — the frontend's version of
models-first.
