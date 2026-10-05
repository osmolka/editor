# AI-Native Full Stack Developer Assignment

## Objective

Build a lightweight collaborative document editor inspired by Google Docs.

The goal is not to recreate Google Docs completely.

The goal is to ship the strongest working version possible within a 4-6 hour timebox while demonstrating:

- Product judgment
- Full stack capability
- Clear prioritization

## Time Limit

4-6 hours.

A focused partial solution is preferred over an overextended implementation.

---

## Requirements

### 1. Document Creation and Editing

Users must be able to:

- Create a new document
- Rename a document
- Edit document content in a browser
- Save documents
- Reopen documents

The editor must support:

- Bold
- Italic
- Underline
- Headings or text size variation
- Bulleted lists
- Numbered lists

---

### 2. File Upload

Support at least one product-relevant upload workflow.

Examples:

- Import .txt, .md, or .docx into a new document
- Attach files to a document
- Import content into an existing draft

If file types are limited, this must be documented in the UI and README.

---

### 3. Sharing

Implement a simple sharing model.

Must include:

- Document owner
- Ability to grant another user access
- Visible distinction between owned and shared documents

Users may be simulated using seeded accounts or mocked authentication.

---

### 4. Persistence

Persist documents and sharing data so that:

- Documents survive page refresh
- Formatting is reasonably preserved
- Sharing can be demonstrated

Storage may be SQLite, Postgres, Supabase, or another documented solution.

---

### 5. Product and Engineering Quality

Must include:

- Setup instructions
- Working deployment
- Basic validation and error handling
- At least one automated test
- Short architecture note

---

## AI Workflow Note

Provide a short note explaining:

- AI tools used
- Where AI accelerated development
- What AI-generated output was modified or rejected
- How correctness, UX, and reliability were verified

---

## Walkthrough Video

Provide a 3-5 minute walkthrough covering:

- Main user flow
- Working end-to-end functionality
- Intentionally deprioritized functionality
- Key implementation decisions
- How AI supported the workflow

---

## Deliverables

- Source code
- README.md
- Architecture note
- AI workflow note
- SUBMISSION.md
- Live deployment URL
- Walkthrough video URL
- Screenshots or demo GIF if necessary

---

## Constraints

- Keep scope intentionally small
- Do not attempt to build all Google Docs functionality
- Prefer depth over breadth
- Any framework or tooling may be used
- AI tools are allowed
- Reviewers must not need paid services

---

## Evaluation Criteria

- Product judgment
- Full stack execution
- Editing experience
- File upload implementation
- Sharing implementation
- Deployment quality
- Code maintainability
- Prioritization under time pressure
- Communication quality
- Responsible AI usage

---

## Optional Stretch Goals

Optional only:

- Real-time collaboration indicators
- Comments
- Version history
- Export to PDF or Markdown
- Advanced permissions

Do not sacrifice core requirements for stretch goals.
