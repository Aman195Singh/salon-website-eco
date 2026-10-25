# Instructions for AI Coding Agents

## 1. Project Context

This is a beginner-led project. Explain important decisions plainly and make small, reviewable changes. Prefer simple, readable, low-cost solutions.

## 2. Read the Right Documents

Before changing code, read in this order:
1. `AGENTS.md` — rules for working safely.
2. `PRODUCT_VISION.md` — long-term direction.
3. `VERSION_ROADMAP.md` — release boundaries.
4. `CURRENT_STATE.md` — known state and verification gaps.
5. The active release PRD: `PRD-V2.md` for V2 Appointment Booking work (`docs/archive/PRD-V1.5.md` for historical baseline).
6. `DESIGN.md` — shared design rules.
7. Relevant items in `TASKS.md`.

Inspect actual code before assuming that documented functionality exists or works.

## 3. Current Release and Version Boundaries

- **Active target:** V2 — Phase 1: Appointment Booking Management MVP.
- Historical records of earlier releases are preserved in `docs/archive/` (`PRD-V1.md`, `PRD-V1.5.md`, `PRE_V1.5_FIXES.md`, `V1.5_PROGRESS.md`, `V1.5_RELEASE_REPORT.md`). Do not rewrite them.
- `PRD-V2.md` is the authoritative requirements source for V2 implementation.
- `VERSION_ROADMAP.md` describes release phases across V1, V1.5, V2, and future releases.
- `CURRENT_STATE.md` must distinguish verified features from reported or unverified features.
- `TASKS.md` tracks current implementation and verification tasks.

V2 builds upon the verified V1.5 baseline. Preserve all existing working behaviour, CMS capabilities, and data.

## 4. Mandatory Compatibility Rules

- Do not remove, rename, or silently alter existing pages, routes, dashboard sections, account flows, APIs, or user-visible behaviour from V1.5.
- Do not delete or overwrite existing data.
- Prefer additive schema changes and the smallest coherent implementation.
- Do not change the framework, authentication, database, storage, analytics, or deployment provider without approval.
- Do not add a paid service, API account, or dependency with material cost/security impact without explaining the trade-offs and receiving approval.
- If a schema change is necessary, explain why first and provide a migration, backup, and recovery plan.
- Run relevant regression tests after changes.
- Stop and report if requirements conflict with existing behaviour or architecture instead of silently choosing.

## 5. V2 Boundaries — Booking MVP First

- **In Scope for V2 Phase 1:** In-person appointment booking, staff scheduling, working hours, breaks, time off, availability calculation, double-booking prevention, customer booking UI, owner appointment calendar, and async notifications.
- **Future Scope (Do Not Implement in Phase 1):** Online payment gateway/refunds, two-way Google Calendar sync, automated waitlists, recurring appointments, WhatsApp receptionist automation, multi-salon tenancy, and SaaS subscription billing. See `VERSION_ROADMAP.md` and `PRD-V2.md`.

## 6. Working Method

For each task:
1. Inspect relevant files and existing implementation.
2. Summarize the goal and give a short plan for non-trivial work.
3. Identify decisions affecting security, data, architecture, privacy, or cost.
4. Make the smallest coherent change.
5. Preserve existing working functionality.
6. Run relevant available checks; never invent results.
7. Inspect the diff and report exactly what changed.
8. Update `TASKS.md` only to reflect actual progress.
9. Update `CURRENT_STATE.md` only after verification.
10. Give the beginner clear browser verification steps.

Do not rebuild the project from scratch to fix a small issue.

## 7. Architecture, Content, and Dependencies

- Follow existing framework conventions.
- Do not choose database, auth, storage, analytics, email, or deployment providers silently.
- Prefer simple, readable code; avoid premature abstractions and unnecessary dependencies.
- Do not invent salon content, prices, testimonials, addresses, business hours, or contact details.
- Use clearly marked `TODO` placeholders or ask for missing details.

## 8. Authentication, Authorization, and Privacy

- Public signup must never automatically grant owner privileges.
- Protect dashboard pages and server/API operations with server-side authentication and authorization.
- Do not rely only on hidden buttons or client-side route checks.
- Keep owner-only enquiries, drafts, and private content protected.
- Never expose session secrets or service-role keys to client code.
- Validate untrusted input server-side.
- Restrict file upload formats and sizes and verify persistent storage behaviour.
- Avoid exposing private customer data in analytics events/logs.
- Add reasonable spam protection/rate limiting where appropriate.
- Do not add tracking without deciding what is collected and providing appropriate disclosure where required.

## 9. CMS and Publishing

- The CMS edits predefined fields and sections only; it is not a free-form page builder.
- Do not allow arbitrary HTML, scripts, or CSS from content fields.
- Validate URLs, text lengths, prices, durations, and uploaded media.
- Draft content must never appear publicly until explicitly published.
- Preview must reflect current edits without accidentally publishing them.
- Do not promise rollback/version history unless implemented and tested.
- Failed saves must not silently discard edits.

## 10. UI and Accessibility

- Follow `DESIGN.md` and preserve the current design unless a scoped improvement requires change.
- Check mobile and desktop layouts for overflow, broken spacing, and unusable navigation.
- Use semantic HTML, labels, meaningful alt text, keyboard accessibility, and visible focus styles.
- Respect reduced-motion preferences.
- Keep links and buttons semantically correct and functional.
- Show loading, success, empty, and error states for data-driven features.

## 11. Email Reply Rules

- The initial V1.5 approach is opening the user's default email application using a safely encoded `mailto:` URL.
- Do not claim an email was sent or delivered because the email app opened.
- Do not automatically mark an enquiry `Resolved` merely because a reply was prepared or an email app opened.
- Direct backend email sending requires separate owner approval and provider/security configuration.

## 12. Testing and Verification

- Inspect `package.json` before assuming available scripts.
- Run relevant lint, type-check, test, and production-build commands that actually exist.
- Test critical flows: public navigation, login/logout, unauthorized access, CMS edit/preview/save/publish, enquiry access, customer own-enquiry isolation, forms, and uploads where applicable.
- Verify drafts are not publicly visible before publishing.
- Do not say checks passed unless they were run and passed.
- Do not mark a task `DONE` until acceptance criteria have been verified.

## 13. Git and Risky Actions

- Do not delete or overwrite user work without explicit approval.
- Before broad or risky changes, inspect Git status and recommend a checkpoint.
- Never expose `.env` contents.
- Do not commit, push, deploy, install paid services, or perform destructive actions unless requested or clearly authorized.

## 14. End-of-Task Report

Report:
- Summary of changes
- Important files changed
- Checks actually run and results
- Manual browser verification steps
- Remaining issues/decisions
- `TASKS.md` status changes, if any

## 15. V2 Booking Implementation Guardrails

- **Database is Source of Truth:** Slot availability display in the browser is strictly advisory. The database transaction and conflict check (`[starts_at, ends_at)`) decide authoritative booking creation.
- **Double-Booking Prevention:** Never rely on application-level checks alone. Enforce no-overlap via PostgreSQL exclusion constraints (`EXCLUDE USING gist`) or serializable row-level locking.
- **Snapshot Persistence:** Always snapshot `service_name_snapshot`, `duration_minutes_snapshot`, and `price_paise_snapshot` on `appointment_services` at booking creation time so future catalogue edits never mutate historical records.
- **Zero Client-Side Trust:** Never trust client-supplied prices, durations, staff eligibility, or status transitions. All parameters must be validated server-side.
- **Asynchronous Notifications:** Decouple messaging from booking creation using the `notification_jobs` transactional outbox. A third-party SMS/email gateway failure must never roll back a valid appointment.
- **Strict State Transitions:** Operational status updates must follow the approved state machine (`confirmed -> arrived -> in_service -> completed`, `cancelled`, `no_show`). Reschedules must be atomic.
- **Preserve Verified Features:** Do not break existing public pages, CMS live preview, enquiries inbox, or RLS security policies.

## 16. Feature Quality Protocol (Applies to EVERY Feature, Fix, or Change)

A feature is NOT done because it compiles or "looks right". It is done only when it is verified to work, including its failure paths.

### Step 1 — Understand Before Coding
- Restate the feature in 3–5 lines: who uses it, what they do, what must happen.
- Inspect the existing code and database first. Reuse existing patterns, components, helpers, and RLS style. Never assume something exists or works; verify by reading the code.
- List assumptions. Ask only about real blockers (cost, security, data loss, unclear business rules). Otherwise use the safest assumption and state it.

### Step 2 — Write the Spec First
- Acceptance criteria as an observable, testable checklist.
- Data flow: UI -> server -> database -> response, detailing validation and permission points.
- Every screen state: loading, empty, success, error, no-permission, slow or offline network.

### Step 3 — Edge-Case Matrix BEFORE Writing Code
Produce table: `Scenario | What can go wrong | Expected behavior | How handled | How tested` covering:
1. **Input:** empty, too long, wrong type, special characters/emoji, extra spaces, duplicates, script/SQL injection.
2. **Auth & Permissions:** not logged in, wrong role, reading another user's data, expired session.
3. **Concurrency:** double click, two users at once, race conditions, duplicate or retried requests, stale data.
4. **Failure:** network error, server error, database error, third-party failure, timeout, partial failure, refresh mid-action.
5. **Time:** timezone (IST), past and future dates, midnight, month and year boundary, leap day.
6. **Data:** null/missing values, old records without new field, large lists, deleted/inactive records, post-migration data.
7. **State:** invalid status transitions, repeated actions, cancel/undo, back button.
8. **UI:** mobile and desktop, keyboard navigation, focus, labels, long text overflow, slow loading.
9. **Security & Privacy:** zero secrets in client code, server-side validation, rate limits on public endpoints, no PII in logs/analytics.
10. **Compatibility:** existing pages, routes, and data keep working (additive changes only).

### Step 4 — Plan and Approval Gate
- Provide a concise step-by-step plan.
- **STOP and ask for approval** before: schema changes, new dependencies, paid services, auth/RLS modifications, or anything that deletes or rewrites existing data.

### Step 5 — Implement Defensively
- Smallest coherent change. Never rewrite working code.
- Validate on the server; enforce DB rules (constraints, RLS).
- No silent failures. Catch every error, log safely, show clear user messages without stack traces/secrets.
- No hard-coded business values, fake data, or leftover placeholders.
- Build loading, empty, and error states in UI.

### Step 6 — Verify With Evidence
- Run every check that exists (lint, build, tests) and report actual outputs.
- Test both happy path and failure cases for each matrix row.
- Automated tests for rule-heavy logic (slots, money, dates, permissions).
- Break the feature intentionally: invalid input, wrong user, double submit, refresh mid-action.
- Provide a numbered manual test script.

### Step 7 — Report & Stop Rules
- Summarize: files changed; edge cases handled/deferred/N/A; checks run and results; un-tested areas; known limitations; manual test script.
- Update `TASKS.md` and `CURRENT_STATE.md` only after actual verification.
- Stop and report if requirements conflict, security/data is uncertain, or checks fail.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
