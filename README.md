# QA Release Tracker

Kanban-style QA issue logging for release cycles — built to replace Excel spreadsheets with structured boards, search, and historical archives.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **JavaScript** (no TypeScript)
- **Tailwind CSS v4**
- **MongoDB** + Mongoose (flexible schema for issues, tags, and archived boards)
- **NextAuth.js** (credentials + guest sessions)
- **@dnd-kit** (drag issues between columns)

## Features

| Feature | Description |
|--------|-------------|
| Kanban board | Drag issues across To Do → In Progress → In Review → Done |
| Issue tracking | Auto `QA-#` IDs, titles, descriptions, priorities |
| Conversation | Threaded comments on each issue for notes and discrepancy discussion |
| Color tags | Bug, Regression, UI, Performance, etc. |
| Filter & sort | Priority, color tag, keyword search, sort by priority/date |
| Auth | Email/password registration and sign-in |
| Guest mode | Quick access without an account |
| Historical records | Archive boards when a release ships; browse and search later |
| Global search | Query issues across active and archived boards |
| Assignees | Assign issues to teammates or named QA staff; filter and sort by assignee |
| Board directory | All boards visible to the team, grouped by project |
| Open access | Any signed-in user can open and edit any board |
| CSV export | Download all issues on a board for spreadsheets and record keeping |

## Getting started

### 1. Install dependencies

```bash
cd qa-issue-tracker
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string (recommended for Vercel) |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; your Vercel URL in production |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push `qa-issue-tracker` to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the root directory to `qa-issue-tracker` if the repo is the monorepo root.
4. Add the same environment variables in **Project → Settings → Environment Variables**.
5. Set `NEXTAUTH_URL` to `https://your-domain.vercel.app`.
6. Deploy.

MongoDB Atlas: allow access from `0.0.0.0/0` (or Vercel IPs) for serverless functions.

## Project structure

```
qa-issue-tracker/
├── app/                    # Pages & API routes
│   ├── api/
│   │   ├── auth/           # NextAuth + register
│   │   ├── boards/         # CRUD + archive + export
│   │   └── issues/         # CRUD, search, reorder
│   ├── boards/             # Directory, create, kanban view
│   ├── login/ register/ search/
├── components/             # Kanban, filters, modals
├── lib/                    # MongoDB, auth, constants
└── models/                 # User, Board, Issue schemas
```

## Data model (boards = “sheets”)

Each **board** is one MongoDB document — the equivalent of an Excel workbook tab for a release QA cycle. It owns its own metadata, kanban **columns** (embedded array), and links to all issues on that sheet.

```
User (registered accounts only)
  └── ownerId / createdBy / authorId / assigneeId (string refs, not ObjectId)

Board  ← one document per “sheet”
  ├── name, projectName, releaseVersion, status (active|archived)
  ├── columns[] (embedded: todo, in_progress, …)
  ├── assigneeRoster[] (extra names for assignees)
  └── ownerId → User id or guest_* id

Issue  ← rows on the sheet
  ├── boardId → Board (required, indexed)
  ├── issueNumber (unique per board: QA-1, QA-2, …)
  ├── status → must match a column id on parent Board
  └── createdBy, assigneeId, assigneeName

Comment  ← conversation on an issue
  ├── issueId → Issue (required)
  └── boardId → Board (denormalized for queries; always matches issue’s board)
```

Deleting a **board** removes all its **issues** and **comments**. Deleting an **issue** removes its **comments**.

## Why MongoDB over SQL?

Issue payloads vary (long descriptions, future custom fields). Archiving whole boards and text search maps naturally to document storage without heavy migrations — a good fit for QA tooling on Vercel serverless.

## License

Private / portfolio use.
