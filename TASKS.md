# Salon Website — Task Tracker

**Current release:** V2 — Phase 1: Appointment Booking Management MVP (V1.5 Released)  
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
- [x] Implement controlled owner provisioning. (`DONE` - Role user by default, manual owner promotion; trigger blocks self-promotion `FIX-01`)
- [x] Protect dashboard routes and database operations. (`DONE` - Client-side navigation redirect in layout + Row Level Security in Supabase database verified via automated test script `FIX-07`)
- [x] Test unauthorized access. (`DONE` - Non-owner access blocked by RLS returning 0 rows / error on owner tables, redirected to login on dashboard `FIX-07`)

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
- [x] Record known limitations and release notes. (`DONE` - Documented in PRE_V1.5_FIXES.md and CURRENT_STATE.md)

## Phase 7 — V1.5 Quality Release

- [x] V15-01: Baseline code audit, fill CURRENT_STATE.md, manual regression checklist. (`DONE`)
- [x] V15-02: Loading, empty, success, and error states across login, account, contact, analytics. (`DONE`)
- [x] V15-03: Responsive layout polish (320px–1440px) and non-intrusive mobile chatbot positioning. (`DONE`)
- [x] V15-04: Enquiry inbox search, date filtering (all/today/7d/30d), and contact quick actions. (`DONE`)
- [x] V15-05: Reply via Email zero-setup mailto composer with editable fields and copy fallback. (`DONE`)
- [x] V15-06: Verified contact quick actions (wa.me, tel:, maps) in Footer, Contact page, and cards. (`DONE`)
- [x] V15-07: CMS save states (Saving/Saved/Failed), beforeunload prompt, publish confirm, inline validation. (`DONE`)
- [x] V15-08: Security and privacy re-audit, rate-limiter memory pruning, and safe UUID validation. (`DONE`)
- [x] V15-09: SEO metadata, sitemap.xml, robots.txt, robots noindex on private routes, LocalBusiness JSON-LD. (`DONE`)
- [x] V15-10: Accessibility (prefers-reduced-motion, focus-visible, skip link, dialog Escape) and performance. (`DONE`)
- [x] V15-11: Basic legal pages (/privacy, /terms) with draft review notices linked in Footer. (`DONE`)
- [x] V15-12: Testimonials deferred; placeholder reviews removed from public home page. (`DONE`)
- [x] V15-13: Analytics readability, descriptive metric subtitles, timeframe label, and empty states. (`DONE`)
- [x] V15-14: Full regression, RLS test script verification, and release documentation. (`DONE`)

## Phase 8 — V2 Appointment Booking Management MVP (Active)

Authorizing PRD: `PRD-V2.md`

### 8.0 Documentation & Safety Architecture
- [x] V2-00: Audit repository and organize V2 booking blueprint. (`DONE`)
- [x] V2-01: Establish `PRD-V2.md` as single source of truth for V2 booking requirements. (`DONE`)
- [x] V2-02: Update `AGENTS.md`, `VERSION_ROADMAP.md`, `CURRENT_STATE.md`, and `DESIGN.md`. (`DONE`)

### 8.1 Database Schema & Migration Foundation
- [ ] V2-03: Create migration for `staff`, `staff_services`, `staff_working_hours`, `staff_breaks`, and `staff_time_off`. (`TODO`)
- [ ] V2-04: Create migration for `customers`, `appointments`, `appointment_services` (snapshots), `appointment_events`, and `notification_jobs`. (`TODO`)
- [ ] V2-05: Add foreign keys, check constraints, indexes, and PostgreSQL exclusion / row locking conflict rules. (`TODO`)
- [ ] V2-06: Implement and test Row Level Security (RLS) policies for all new booking tables. (`TODO`)

### 8.2 Availability Calculation Engine
- [ ] V2-07: Implement pure slot calculation module (`src/lib/booking/availability.js`) supporting durations, buffers, working hours, breaks, time off, and notice window. (`TODO`)
- [ ] V2-08: Add unit and boundary tests for slot calculation. (`TODO`)
- [ ] V2-09: Build availability server API endpoint (`GET /api/booking/availability`). (`TODO`)

### 8.3 Booking Write Path & Concurrency Protection
- [ ] V2-10: Implement server booking creation transaction with canonical price/duration lookup and snapshot persistence. (`TODO`)
- [ ] V2-11: Add idempotency handling and secure random public booking reference generation. (`TODO`)
- [ ] V2-12: Write automated concurrency test (`scripts/test-booking-concurrency.mjs`) verifying exactly 1 of 20+ parallel requests succeeds. (`TODO`)

### 8.4 Customer Booking Journey
- [ ] V2-13: Build mobile-first customer booking page (`/book`) with service, staff, date, and slot selection. (`TODO`)
- [ ] V2-14: Implement customer review, details form, loading, empty, slot-taken, and success states. (`TODO`)
- [ ] V2-15: Implement customer self-service cancellation and reschedule flows (cutoff enforced). (`TODO`)

### 8.5 Owner & Staff Appointment Operations
- [ ] V2-16: Build owner calendar and appointment list view (`/dashboard/appointments`) with status/date/staff filters. (`TODO`)
- [ ] V2-17: Implement operational status transitions (`arrived`, `in_service`, `completed`, `cancelled`, `no_show`) and manual booking form. (`TODO`)
- [ ] V2-18: Build staff management and schedule/leave editor (`/dashboard/staff`). (`TODO`)

### 8.6 Notifications, Hardening & Final Verification
- [ ] V2-19: Implement transactional outbox processor for asynchronous booking confirmations and reminders. (`TODO`)
- [ ] V2-20: Add rate limiting, abuse protection, and error correlation IDs. (`TODO`)
- [ ] V2-21: Full regression testing: V1.5 public pages, CMS editor, enquiries, customer account, build, and lint. (`TODO`)

## Blockers / Decisions Resolved

- Auth/onboarding: Resolved (Supabase Auth, default 'user' role, owner SQL promotion).
- Framework/backend/database: Resolved (Next.js 16 + Supabase DB + RLS).
- Persistent image storage: Configured for Supabase.
- Enquiry and support delivery: Resolved (Supabase `enquiries` and `support_requests` tables).
- Analytics provider/method: Resolved (Privacy-friendly first-party events table).
- Hosting/domain/budget: Ready for Vercel/Netlify free tier deployment with Supabase.
- V2 Architecture: Resolved in `PRD-V2.md` (Modular monolith, DB source of truth, no-payment MVP, snapshot immutability, async notification outbox).

