# Instructions for AI Coding Agents

## 1. Project Context

This is a beginner-led project. Explain important decisions plainly and make small, reviewable changes. Prefer simple, readable, low-cost solutions.

## 2. Read the Right Documents

Before changing code, read in this order:
1. `AGENTS.md` — rules for working safely.
2. `PRODUCT_VISION.md` — long-term direction.
3. `VERSION_ROADMAP.md` — release boundaries.
4. `CURRENT_STATE.md` — known state and verification gaps.
5. The active release PRD: `PRD-V1.5.md` for V1.5 work.
6. `DESIGN.md` — shared design rules.
7. Relevant items in `TASKS.md`.

Inspect actual code before assuming that documented functionality exists or works.

## 3. Current Release and Version Boundaries

- **Active target:** V1.5 — backward-compatible improvement release.
- `PRD-V1.md` is the historical record of original V1 requirements. Do not rewrite it to describe V1.5.
- `PRD-V1.5.md` is the requirements source for V1.5 implementation.
- `VERSION_ROADMAP.md` describes what belongs to V1, V1.5, and V2.
- V2 is planned only. Do not implement V2 systems during V1.5.
- `CURRENT_STATE.md` must distinguish verified features from reported or unverified features.
- `TASKS.md` tracks current implementation and verification tasks.

V1.5 is not a rebuild. Preserve existing working behaviour and data.

## 4. Mandatory V1.5 Compatibility Rules

- Do not remove, rename, or silently alter existing pages, routes, dashboard sections, account flows, APIs, or user-visible behaviour.
- Do not delete or overwrite existing data.
- Prefer additive changes and the smallest coherent implementation.
- Do not change the framework, authentication, database, storage, analytics, or deployment provider without approval.
- Do not add a paid service, API account, or dependency with material cost/security impact without explaining the trade-offs and receiving approval.
- If a schema change is necessary, explain why first and provide a migration, backup, and recovery plan.
- Run relevant regression tests after changes.
- Stop and report if requirements conflict with existing behaviour or architecture instead of silently choosing.

## 5. V2 Features — Do Not Implement in V1.5

These are future scope: booking management, availability/calendar, customer CRM/lifecycle, automated reminders, WhatsApp automation/AI receptionist, marketing automation, automated review/feedback collection, advanced business analytics, multi-salon tenancy, and SaaS billing. See `VERSION_ROADMAP.md`.

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
