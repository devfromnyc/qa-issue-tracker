# QA Release Tracker

Kanban-style QA issue logging for release cycles — built to replace Excel spreadsheets with structured boards, issue conversations, search, and historical archives.

Designed for **company deployments**: each install connects to **one MongoDB instance** (in-house or Atlas), so all data stays within that organization. Multi-tenant SaaS is not required for v1.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (email/password, JWT sessions) |
| Drag & drop | @dnd-kit |

---

## Features

| Feature | Description |
|--------|-------------|
| **Board directory** | All QA boards grouped by project; filter active / archived / all |
| **Kanban board** | Drag issues across To Do → In Progress → In Review → Done |
| **Issue tracking** | Auto `QA-#` IDs, titles, descriptions, priorities |
| **Conversation** | Threaded comments per issue for notes and discrepancy discussion |
| **Color tags** | Bug, Regression, UI, Performance, Accessibility, etc. |
| **Assignees** | Assign to registered teammates; filter and sort by assignee |
| **Filter & sort** | Priority, color tag, assignee, keyword search, sort by date/priority |
| **Historical records** | Archive boards when a release ships; browse and search later |
| **Global search** | Query issues (and comments) across active and archived boards |
| **CSV export** | Download all issues on a board for spreadsheets and record keeping |
| **Interactive demo** | `/demo` — try the full UI with **sessionStorage only** (no login, no DB) |
| **Team access** | Any signed-in user can open and edit any board on the instance |

---

## Authentication & access model

### Signed-in users (production)

- **Register** or **sign in** with email and password.
- **Middleware** protects `/boards`, `/search`, and all `/api/boards` + `/api/issues` routes.
- Unauthenticated requests are redirected to `/login`; API calls return 401.
- Sessions are JWT cookies signed with `NEXTAUTH_SECRET`.

### Interactive demo (evaluation only)

- Visit **`/demo`** — no account and **no MongoDB** required.
- Sample board with issues, drag-and-drop, filters, assignees, and comments.
- All changes persist in **`sessionStorage`** for the current browser tab (survives page refresh; cleared when the tab/session ends).
- **Nothing is written to the server.** Use **Reset demo** to restore sample data.

### What we intentionally do not have (yet)

- Guest users writing to the database
- Google / Microsoft SSO
- Email invite flow
- Multi-tenant orgs inside one database (one MongoDB per company install is the expected model)

---

## Getting started

### 1. Install dependencies

```bash
cd qa-issue-tracker
npm install
```

### 2. Try the demo (optional, no setup)

```bash
npm run dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo) — works without `.env.local`.

### 3. Environment variables (signed-in app)

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (Atlas or self-hosted) |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; production URL on Vercel |
| `NEXTAUTH_SECRET` | Random signing key for sessions |

Generate `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. MongoDB setup (Atlas)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → create a user.
3. **Network Access** → allow your IP (or `0.0.0.0/0` for Vercel).
4. **Connect** → copy the connection string into `MONGODB_URI`.

### 5. Run locally

```bash
npm run dev
```

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/demo` | Interactive sandbox (no auth) |
| `/register` | Create account |
| `/login` | Sign in |
| `/boards` | Board directory (auth required) |
| `/boards/[id]` | Kanban view |
| `/search` | Global issue search |

---

## Deploy to Vercel

1. Push `qa-issue-tracker` to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set **Root Directory** to `qa-issue-tracker` if the repo is a monorepo.
4. Add environment variables: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
5. Set `NEXTAUTH_URL` to `https://your-domain.vercel.app` (no trailing slash).
6. Deploy.

For **in-house** use, deploy to your own infrastructure with a MongoDB instance on your network instead of Atlas.

---

## Data model (boards = “sheets”)

Each **board** is one MongoDB document — like an Excel sheet for a release QA cycle.

```
User (registered accounts)
  └── referenced by ownerId, createdBy, authorId, assigneeId (string ids)

Board
  ├── name, projectName, releaseVersion, status (active | archived)
  ├── columns[] (embedded kanban columns)
  ├── assigneeRoster[] (optional extra assignee names)
  └── ownerId → User

Issue
  ├── boardId → Board (required)
  ├── issueNumber (unique per board: QA-1, QA-2, …)
  ├── status (must match a column on the parent board)
  └── assigneeId, assigneeName, createdBy

Comment
  ├── issueId → Issue (required)
  └── boardId → Board (denormalized for board-scoped queries)
```

**Cascade deletes:** removing a board deletes its issues and comments; removing an issue deletes its comments.

---

## Project structure

```
qa-issue-tracker/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth + register
│   │   ├── boards/            # CRUD, archive, export, assignees, roster
│   │   └── issues/            # CRUD, search, reorder, comments
│   ├── boards/                # Directory, create, kanban view
│   ├── demo/                  # SessionStorage sandbox (no API)
│   ├── login/  register/  search/
│   └── page.js                # Landing
├── components/                # Kanban, filters, modals, conversation
├── lib/
│   ├── auth.js                # NextAuth config
│   ├── boardAccess.js         # Access helpers
│   ├── demoStore.js           # Demo sessionStorage logic
│   ├── entityLinks.js         # Cascade delete helpers
│   └── mongodb.js
├── models/                    # User, Board, Issue, Comment
└── middleware.js              # Auth gate for app + API routes
```

---

## Why MongoDB?

Issue payloads vary (long descriptions, comments, tags). Archiving whole boards and text search fit document storage without rigid migrations — a practical choice for QA tooling and Vercel serverless.

---

## License

Private / portfolio use.
