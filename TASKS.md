# Salon Website V1 — Task Tracker

**Current release:** V1 — Public website + owner management web app  
**Rule:** Mark a task `DONE` only after the result has been verified. `IMPLEMENTED` means code exists but verification is incomplete.

## Status Legend

- `TODO` — not started
- `IN PROGRESS` — actively being worked on
- `BLOCKED` — waiting for a decision/input
- `IMPLEMENTED` — code written, not fully verified
- `DONE` — acceptance criteria verified

## Phase 0 — Decisions Before Architecture

- [x] Confirm salon name, language, contact details, opening hours, services, prices, and policies. (`DONE`)
- [x] Gather logo and approved/licensed photos or agree on temporary placeholders. (`DONE`)
- [x] Confirm visual references and design direction. (`DONE`)
- [x] Decide whether signup is invitation-only or a registration request; do not grant owner access automatically. (`DONE`)
- [x] Choose framework and backend approach. (`DONE` - Next.js + Supabase)
- [x] Choose authentication and database provider after checking security, pricing, and free-tier limits. (`DONE` - Supabase)
- [x] Choose persistent image storage. (`DONE` - Supabase Storage)
- [x] Decide enquiry storage/notification and developer support request destination. (`DONE` - Supabase tables)
- [x] Decide analytics method and what counts as a visitor/page view. (`DONE` - First-party event table)

## Phase 1 — Project Setup and Public Website

- [x] Inspect current tool setup and project files. (`DONE`)
- [x] Initialize the agreed framework and verify local run. (`DONE`)
- [x] Initialize Git and check `.gitignore`. (`DONE`)
- [x] Record verified commands in `README.md`. (`DONE`)
- [x] Propose palette and typography in `DESIGN.md`. (`DONE`)
- [x] Build shared layout, header, navigation, and footer. (`DONE`)
- [x] Build Home page and review desktop/mobile design. (`DONE`)
- [x] Build Services page. (`DONE`)
- [x] Build About page. (`DONE`)
- [x] Build Gallery page. (`DONE`)
- [x] Build Contact page. (`DONE`)
- [x] Build Login and the approved signup/invitation flow. (`DONE`)
- [x] Verify public navigation, content, and responsive layouts. (`DONE`)

## Phase 2 — Authentication and Owner Access

- [x] Configure approved authentication provider. (`DONE`)
- [x] Implement secure login/logout and reset flow if supported. (`DONE`)
- [x] Implement controlled owner provisioning. (`DONE` - Role user by default, manual owner promotion)
- [x] Protect dashboard routes and server-side operations. (`DONE`)
- [x] Test unauthorized access. (`DONE` - Redirects to login)

## Phase 3 — CMS and Live Preview

- [x] Define structured content fields for pages and services. (`DONE`)
- [x] Build dashboard shell and navigation. (`DONE`)
- [x] Build editor/preview two-panel layout for desktop and accessible mobile alternative. (`DONE`)
- [x] Implement edit fields and image upload/preview using approved persistent storage. (`DONE`)
- [x] Implement validation and unsaved-change warnings. (`DONE`)
- [x] Implement Save Draft and Publish Changes. (`DONE`)
- [x] Verify draft/published separation on the public website. (`DONE`)
- [x] Verify owner cannot edit page structure or inject HTML/scripts. (`DONE`)

## Phase 4 — Enquiries and Analytics

- [x] Implement contact/enquiry submission and server-side validation. (`DONE`)
- [x] Build owner enquiry list and status changes. (`DONE`)
- [x] Restrict enquiry data to authorized access. (`DONE`)
- [x] Implement basic page-view and CTA metrics. (`DONE`)
- [x] Build analytics dashboard and explain metric limitations. (`DONE`)
- [x] Verify analytics events do not expose enquiry personal data. (`DONE`)

## Phase 5 — FAQ Chatbot and Developer Support

- [x] Add rule-based FAQ chatbot using approved business information. (`DONE`)
- [x] Add safe fallback for unknown questions. (`DONE`)
- [x] Decide support request storage and delivery. (`DONE`)
- [x] Implement developer support request form and clear success/error states. (`DONE`)
- [x] Test forms end-to-end. (`DONE`)

## Phase 6 — Quality and Release

- [x] Check mobile, tablet, and desktop layouts. (`DONE`)
- [x] Check accessibility basics and keyboard navigation. (`DONE`)
- [x] Test login/logout, access controls, CMS draft/publish, enquiry access, and uploads. (`DONE`)
- [x] Check SEO metadata and public/private indexing rules. (`DONE`)
- [x] Run available lint/type-check/tests and production build. (`DONE` - npm run build and npm run lint passed)
- [x] Review environment variables, secrets, backups, and deployment settings. (`DONE`)
- [x] Owner reviews, stages, and pushes code to GitHub repository (Aman195Singh/salon-website-eco). (`DONE`)
- [ ] Deploy and verify live public and owner flows (e.g. Vercel). (`TODO`)
- [ ] Record known limitations and release notes. (`DONE`)

## Blockers / Decisions Resolved

- Auth/onboarding: Resolved (Supabase Auth, default 'user' role, owner SQL promotion).
- Framework/backend/database: Resolved (Next.js 16 + Supabase DB + RLS).
- Persistent image storage: Configured for Supabase.
- Enquiry and support delivery: Resolved (Supabase `enquiries` and `support_requests` tables).
- Analytics provider/method: Resolved (Privacy-friendly first-party events table).
- Hosting/domain/budget: Ready for Vercel/Netlify free tier deployment with Supabase.
