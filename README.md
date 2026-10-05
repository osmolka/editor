# Editor

A lightweight collaborative document editor: create, rename, edit (bold/italic/underline/headings/lists),
import, share, and delete documents between a small set of seeded users.

Open a document and edit its title at the top of the workspace. The title saves automatically and
updates in the sidebar after saving.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and [AI_WORKFLOW.md](./AI_WORKFLOW.md)
for how AI tools were used to build this.

## Tech Stack

- **Frontend:** React + TypeScript (Vite), Tiptap editor
- **Backend:** Node.js + TypeScript, Express
- **Database:** SQLite via Prisma

## Users

There is no real authentication. Two seeded users exist — **Alice** (`alice@example.com`) and
**Bob** (`bob@example.com`). A dropdown in the app ("Acting as...") lets you switch between them to
simulate different logins; the choice is sent as an `X-User-Id` header on every API request.

## File Upload

Only **`.txt`** and **`.md`** files can be imported. Both are treated as plain text (no Markdown
rendering) — the raw file content becomes the new document's content, and the title is derived
from the filename. Any other file type is rejected by both the UI (file picker + client-side check)
and the server.

## Setup

Requires Node.js 20+.

```bash
npm install                 # installs client + server workspaces
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run prisma:migrate      # creates the SQLite DB and applies the schema (seeds Alice & Bob)
```

## Running Locally

```bash
npm run dev
```

This runs the client (http://localhost:5173) and server (http://localhost:4000) together, with the
client dev server proxying `/api` requests to the backend.

## Running Tests

```bash
npm test
```

Runs the backend test suite (Vitest + Supertest) against an isolated SQLite test database — it
never touches your local dev database.

## Production Build

```bash
npm run build
npm start
```

`npm start` applies any pending migrations, re-runs the (idempotent) seed script, and then starts a
single Express server that serves both the built client and the API from one port — this is the
intended deployment shape (see `server/package.json`'s `start` script).

Required environment variables in production: `DATABASE_URL`, `CLIENT_ORIGIN` (only needed if the
client is ever served from a different origin than the API), `PORT` (most hosts set this
automatically).

## Known Limitations

- SQLite is a single file on disk. On most free hosting tiers this disk is **ephemeral** — data can
  be reset on redeploys/restarts. Acceptable for a review/demo deployment, but not production-durable.
- Sharing is single-tier: anyone a document is shared with gets full edit access (no view-only role,
  no revoke). This matches the assignment's "simple sharing model" scope.
- No real-time collaboration — last save wins if two users edit the same document at once.
- Deleting a document is permanent — no soft delete, recycle bin, or restore. Deleting a shared
  document removes it (and its sharing records) for every collaborator, not just the owner.
