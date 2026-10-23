# Instructions for AI Coding Agents

## 1. Project Context

This is a beginner-led project. Explain important decisions plainly and make small, reviewable changes.

## 2. Source of Truth

Before changing code, read:
1. `AGENTS.md`
2. `PRODUCT_VISION.md` for long-term context
3. `PRD-V1.md` for current release requirements
4. `DESIGN.md` for visual rules
5. Relevant items in `TASKS.md`

The updated `PRD-V1.md` defines V1 as a public salon website plus a single-salon owner management application. Do not use older statements that say V1 is public website only. If documents conflict, identify the conflict instead of silently choosing.

## 3. Current Version and Scope

- Current release: **V1 — Public salon website + owner management web app**.
- Implement only approved requirements in `PRD-V1.md`.
- Do not add appointment booking, payments, WhatsApp automation, AI receptionist, multi-salon tenancy, SaaS billing, staff management, inventory, or advanced CRM.
- Keep future expansion possible through clean, understandable code; do not build speculative future features.

## 4. Working Method

For each task:
1. Inspect the existing project and relevant files first.
2. Restate the goal and give a short plan for non-trivial changes.
3. Identify missing decisions that affect security, architecture, budget, or data handling before implementation.
4. Make the smallest coherent change that satisfies the approved task.
5. Preserve existing working functionality.
6. Run relevant checks available in the project.
7. Inspect the diff and report what changed.
8. Update `TASKS.md` only to reflect the actual state.
9. Explain how the beginner can verify the result in a browser.

Do not rebuild or replace the project from scratch to fix a small issue.

## 5. Architecture and Dependencies

- Do not choose database, authentication, storage, analytics, email, or deployment providers silently. Present simple options, free-tier/cost considerations, and get approval before adding a service that requires an account or billing.
- Follow the existing framework conventions.
- Prefer simple, readable code over clever abstractions.
- Reuse components when it improves consistency; avoid premature abstraction.
- Do not add dependencies without a clear need. Explain significant additions.
- Do not change the technology stack without approval.
- Do not invent salon content, prices, testimonials, addresses, business hours, or contact details. Use clearly marked `TODO` placeholders or ask.

## 6. Authentication and Authorization

- Public signup must never automatically grant owner privileges.
- Protect dashboard pages and server/API operations with server-side authentication and authorization checks.
- Do not rely only on hiding buttons or client-side route checks.
- Enforce least privilege and keep owner-only enquiries/content drafts private.
- Do not implement insecure homemade password storage or authentication when a reputable supported provider is appropriate.
- Never expose session secrets or service-role keys to client code.

## 7. CMS and Publishing

- The CMS edits only predefined fields and sections; it is not a free-form page builder.
- Do not allow arbitrary HTML, scripts, or CSS from content fields.
- Validate URLs, text lengths, prices, durations, and uploaded media appropriately.
- Draft content must never appear on public pages until explicitly published.
- Preview must reflect current edits without accidentally publishing them.
- Do not promise rollback/version history unless it is implemented and tested.

## 8. Security and Privacy

- Never place secrets, credentials, tokens, or private customer data in source files or `public/`.
- Validate untrusted input server-side.
- Restrict file upload formats and size, and use persistent storage approved for production.
- Protect enquiry and support records with server-side access controls.
- Collect only necessary personal data and avoid exposing it in analytics events/logs.
- Add reasonable spam protection and rate limiting where appropriate to public forms.
- Do not add tracking without deciding what is collected and providing appropriate disclosure where required.
- Do not claim a form submits data unless end-to-end behaviour is configured and tested.

## 9. UI and Accessibility

- Follow `DESIGN.md`.
- Check mobile and desktop layouts for overflow, broken spacing, and unusable navigation.
- Use semantic HTML, labels, meaningful alt text, keyboard accessibility, and visible focus styles.
- Respect reduced-motion preferences.
- Keep links and buttons semantically correct and functional.
- Show loading, success, empty, and error states for data-driven features.

## 10. Testing and Verification

- Inspect `package.json` before assuming available scripts.
- Run the relevant lint, type-check, test, and production-build commands that actually exist.
- Test critical flows: public navigation, login/logout, unauthorized access, CMS edit/preview/save/publish, enquiry access, and forms.
- Verify that drafts are not publicly visible before publishing.
- Do not say checks passed unless they were run and passed.
- If a check cannot be run, state why.
- Do not mark a task `DONE` until its acceptance criteria have been verified.

## 11. Git and Risky Actions

- Do not delete or overwrite user work without explicit approval.
- Before broad or risky changes, inspect Git status and recommend a checkpoint.
- Never expose `.env` contents in output.
- Do not commit, push, deploy, install paid services, or perform destructive actions unless requested or clearly authorized.

## 12. End-of-Task Report

At the end of each task, report:
- Summary of changes
- Important files changed
- Checks run and their actual results
- Manual browser verification the owner should perform
- Remaining issues or decisions needed
- `TASKS.md` status changes, if any

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
