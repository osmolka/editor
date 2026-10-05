# Architecture Note

## Shape

One Express process serves both the REST API (`/api/*`) and the built React static assets from the
same port — no separate frontend host, no CORS configuration needed in production. Locally, Vite's
dev server (port 5173) proxies `/api` to the backend (port 4000) for hot reload.

```
client/  React + TypeScript (Vite), Tiptap editor
server/  Express + TypeScript, Prisma -> SQLite
```

## Identity

There's no real authentication. Two seeded users (Alice, Bob) exist in the database. The client
sends an `X-User-Id` header on every request; `server/src/middleware/current-user.ts` resolves it
to a row in the `User` table or rejects with `401`. This is intentionally insecure — it's a stand-in
for login, not a security boundary, matching the assignment's "seeded users instead of real auth"
constraint.

## Data Model

Three Prisma models (`server/prisma/schema.prisma`):

- **User** — id, email, name
- **Document** — id, title, content (HTML string from Tiptap), ownerId, timestamps
- **DocumentShare** — join table (documentId, userId), unique per pair

Sharing is single-tier: a row in `DocumentShare` grants full edit access, nothing more. There's no
role/permission column, no revoke endpoint — the smallest model that satisfies "owner exists, owner
can grant access, shared docs are visibly separate from owned ones."

## Request Flow

Every document-scoped route (`GET /:id`, `PATCH /:id/title`, `PATCH /:id/content`) runs the same
access check: load the document, allow it if the current user is the owner, otherwise look for a
`DocumentShare` row, otherwise `403`. Granting a share (`POST /:id/shares`) is itself owner-only and
idempotent (upsert on the unique `(documentId, userId)` pair), so re-sharing with the same person is
a no-op rather than an error.

## Editing & Saving

The frontend holds one Tiptap editor per open document (`StarterKit` configured down to only bold,
italic, underline, headings, and bullet/numbered lists — everything else StarterKit ships is
explicitly disabled). Title and content both autosave on a short debounce, independently, directly
against the two `PATCH` endpoints — there's no draft/dirty-state model beyond that.

## File Import

`.txt`/`.md` uploads (`POST /api/import`, Multer, in-memory, 2MB cap, extension-filtered) are read
as plain text, HTML-escaped, and wrapped into paragraphs — not parsed as Markdown. This keeps import
to a single code path regardless of extension, at the cost of not rendering Markdown syntax.

## Deliberately Excluded

Real auth (OAuth/JWT), roles/permissions, revoke, real-time collaboration, comments, version
history — all out of scope per the assignment's constraints, not oversights.
