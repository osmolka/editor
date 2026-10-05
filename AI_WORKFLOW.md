# AI Workflow Note

## Tools Used

**Claude Code** (Anthropic's CLI agent) was used throughout the implementation process for scaffolding, code generation, 
debugging assistance, reviews, and documentation generation. Development was driven through a 
sequence of intentionally scoped prompts (foundation scaffold → persistence layer → document APIs → editor UI → 
sharing → file upload → automated test → a structured self-review → fixing only the review's must-fix findings → 
document deletion → documentation review), with architectural decisions, scope management, validation, and final 
acceptance performed by the developer.

## Where AI Accelerated Development

- Scaffolding: Vite/React/TypeScript and Express/TypeScript/Prisma project setup, folder structure,
  env config, and dev scripts were generated directly from a short requirements prompt.
- Boilerplate CRUD: the initial implementation of document and sharing REST endpoints, validation, and error handling 
  was generated from a requirement list and then reviewed and validated before acceptance.
- Library research: understanding the current Tiptap v3 editor APIs and selecting only the formatting capabilities 
  required by the assignment.
- Debugging: AI assisted in diagnosing and resolving a TypeScript dependency conflict that blocked builds, 
  including identifying the root cause and validating the fix.
- A self-review pass: after the feature work, a separate instruction asked the agent to act as a
  senior reviewer against the assignment text and classify findings as must/should/optional-fix,
  then the identified must-fix findings were reviewed and addressed before finalizing the implementation.

## What Was Modified or Rejected

Most generated output was accepted after review because prompts intentionally constrained scope and implementation 
boundaries. Generated solutions were reviewed before acceptance, and several areas were refined during implementation, 
particularly around dependency management, deployment configuration, and autosave behavior.

## How Correctness, UX, and Reliability Were Verified

- **Backend validation:** after implementing each API endpoint, I manually exercised both successful and failure 
  scenarios using HTTP requests. This included document creation, document updates, document retrieval, sharing flows, 
  document deletion (owner-only enforcement, cascade removal of related sharing records, not-found/forbidden 
  responses), validation failures, access-control checks, and not-found cases. 
  TypeScript compilation (`npm run build`) was used throughout development to catch type and integration issues early.

- **Frontend validation:** all core user journeys were tested manually in the browser:
  - creating a document;
  - renaming a document;
  - editing document content;
  - deleting a document;
  - saving and reopening documents;
  - applying supported formatting options;
  - uploading supported file types;
  - viewing owned vs. shared documents;
  - sharing a document between seeded users.

  Manual testing was used to verify both functionality and overall usability of the document workflow, including 
  expected behavior after page refreshes and user switching between seeded accounts.

- **Persistence verification:** documents, formatting, and sharing relationships were verified to remain available 
  after the page refreshes and application restarts. Upload-imported documents were also checked to ensure content was 
  stored correctly.

- **Automated testing:** one automated test was added for a core business workflow. The test runs against an isolated 
  test database and verifies that document sharing behaves as expected.

- **Production readiness:** the application was built and executed using the production build process to verify that 
  frontend and backend components work together outside the development environment. Basic error handling, validation 
  paths, and application startup were also verified before submission.

The goal of verification was not only to confirm that individual features worked in isolation, but also to ensure that 
the complete document lifecycle (create → edit → save → share → reopen) functioned reliably end-to-end from a 
user's perspective.
