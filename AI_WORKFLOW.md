# AI Workflow Note

## Tools Used

The entire implementation — backend, frontend, tests, and this documentation — was built with
**Claude Code** (Anthropic's CLI agent), working turn by turn from a sequence of scoped prompts
(foundation scaffold → persistence layer → document APIs → editor UI → sharing → file upload →
automated test → a structured self-review → fixing only the review's must-fix findings).

## Where AI Accelerated Development

- Scaffolding: Vite/React/TypeScript and Express/TypeScript/Prisma project setup, folder structure,
  env config, and dev scripts were generated directly from a short requirements prompt.
- Boilerplate CRUD: the document and sharing REST endpoints, validation, and error handling were
  written in full from a requirements list rather than built up incrementally by hand.
- Library research: looking up the current Tiptap v3 `StarterKit` API (which extensions it bundles,
  how to disable the ones outside the assignment's six allowed formatting features) was done by
  reading the installed package's own `.d.ts` files rather than guessing.
- Debugging a real dependency conflict: installing `@types/multer` pulled in a conflicting
  `@types/express@5` that broke the TypeScript build. The agent diagnosed it (traced the version
  mismatch via `npm ls`), fixed it with an `overrides` pin, and verified with a clean reinstall.
- A self-review pass: after the feature work, a separate instruction asked the agent to act as a
  senior reviewer against the assignment text and classify findings as must/should/optional-fix,
  then a follow-up pass addressed only the must-fix items.

## What Was Modified or Rejected

Nothing was generated and then thrown away wholesale — each feature was scoped narrowly per prompt
(e.g., "document APIs only, no sharing yet," "backend only, no UI") and built once against that
scope, then verified before moving to the next piece. The one place generated code was corrected
after the fact was the review pass itself: it surfaced a real bug (a debounced autosave that
silently dropped an in-flight edit if the editor unmounted before the debounce fired) and a missing
production-readiness gap (the server never served the built client, so there was no deployable
artifact) — both were fixed as a direct result of that review, not of ad hoc eyeballing.

## How Correctness, UX, and Reliability Were Verified

- **Backend:** every endpoint was exercised with `curl` after being written — auth-missing,
  wrong-owner, not-found, validation-failure, and happy-path cases — not just the happy path.
  `npm run build` (`tsc`) was run after every change to catch type errors.
  One automated test (Vitest + Supertest) covers the highest-risk flow: sharing and access control
  end-to-end against an isolated test database.
- **Deployment shape:** the single-service production setup (server serving the built client) was
  verified by actually running `npm run build && npm start` against a throwaway database and
  `curl`-ing the result, not just by reading the code.
- **Frontend UX:** this is the weakest-verified area. Browser automation (Claude in Chrome) was
  offered and declined, so the editor UI was checked only at the level of `tsc`/`vite build` passing
  and the dev server transforming every module without error — **it has not been visually exercised
  in a real browser.** This is called out explicitly rather than implied as "tested," and should be
  the first thing a human checks before relying on this submission.
