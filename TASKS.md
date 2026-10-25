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
- [x] V2-03: Create migration for `staff`, `staff_services`, `staff_working_hours`, `staff_breaks`, and `staff_time_off` (`sql/v2-01-staff-and-working-hours.sql`). (`DONE`)
- [x] V2-04: Create migration for `customers`, `appointments`, `appointment_services` (snapshots), `appointment_events`, and `notification_jobs` (`sql/v2-02-appointments-and-snapshots.sql`). (`DONE`)
- [x] V2-05: Add foreign keys, check constraints, indexes, and PostgreSQL exclusion (`EXCLUDE USING gist`) conflict rules. (`DONE`)
- [x] V2-06: Implement and test Row Level Security (RLS) policies for all new booking tables (`sql/v2-03-booking-rls-policies.sql` & `scripts/test-booking-rls.mjs`). (`DONE`)

### 8.2 Availability Calculation Engine
- [x] V2-07: Implement pure slot calculation module (`src/lib/booking/availability.js`) supporting durations, buffers, working hours, breaks, time off, and notice window. (`DONE`)
- [x] V2-08: Add unit and boundary tests for slot calculation (`scripts/test-availability.mjs`). (`DONE`)
- [x] V2-09: Build availability server API endpoint (`GET /api/booking/availability`). (`DONE`)

### 8.3 Booking Write Path & Concurrency Protection
- [x] V2-10: Implement server booking creation transaction with canonical price/duration lookup and snapshot persistence (`src/app/api/booking/route.js`). (`DONE`)
- [x] V2-11: Add idempotency handling and secure random public booking reference generation. (`DONE`)
- [x] V2-12: Write automated concurrency test (`scripts/test-booking-concurrency.mjs`) verifying exactly 1 of 20+ parallel requests succeeds. (`DONE` - 20 concurrent requests verified: 1 success, 19 conflict 409s)

### 8.4 Customer Booking Journey
- [x] V2-13: Build mobile-first customer booking page (`/book`) with service, staff, date, and slot selection. (`DONE`)
- [x] V2-14: Implement customer review, details form, loading, empty, slot-taken, and success states (`src/app/book/page.js`). (`DONE`)
- [x] V2-15: Implement customer self-service cancellation and reschedule flows (`/book/manage` with cutoff enforced). (`DONE`)

### 8.5 Owner & Staff Appointment Operations
- [x] V2-16: Build owner calendar and appointment list view (`/dashboard/appointments`) with status/date/staff filters. (`DONE`)
- [x] V2-17: Implement operational status transitions (`arrived`, `in_service`, `completed`, `cancelled`, `no_show`) and status API (`/api/booking/status`). (`DONE`)
- [x] V2-18: Build staff management and schedule/leave editor (`/dashboard/staff`). (`DONE` - Specialist profiles, 7-day working hours editor, lunch breaks, and planned absences verified via `scripts/test-staff-management.mjs`)

### 8.6 Notifications, Hardening & Final Verification
- [x] V2-19: Implement transactional outbox processor for asynchronous booking confirmations and reminders (`src/lib/booking/outbox-processor.js`, `/api/booking/notifications`). (`DONE` - Outbox queue, batch processor, retry backoff, and decoupling verified via `scripts/test-notification-outbox.mjs`)
- [x] V2-20: Add rate limiting, abuse protection, security headers, and honeypot (`src/app/api/booking/route.js`, `next.config.mjs`). (`DONE`)
- [x] V2-21: Full regression testing: V1.5 public pages, CMS editor, enquiries, customer account, build (31 routes), and lint. (`DONE` - Full test suite passed across all 7 test scripts)
- [x] V2-22: Registered customer account appointment view (`/account` appointments tab) with live booking history and manage links (`src/app/account/page.js`, PRD-V2 §2.2). (`DONE`)
- [x] V2-23: Specialist chair-side operational portal (`/staff/appointments`) with instant status transitions (`arrived`, `in_service`, `completed`, `no_show`) without owner revenue disclosure (PRD-V2 §2.3). (`DONE`)
- [x] V2-24: Policy cutoff alignment (4 hours for online cancellation) and reschedule abuse protection (max 2 changes) per PRD-V2 §6.2, §12.1, and Table 11 Item 9. (`DONE`)

### 8.7 Salon Staff HR, Attendance, Payroll & Recruitment Suite
- [x] V2-25: Create additive database migration `sql/v2-04-staff-hr-and-payroll.sql` (`staff` HR fields, `staff_attendance`, `staff_payroll`, `staff_recruitment`, updated_at triggers, owner RLS policies). (`DONE`)
- [x] V2-26: Build dedicated staff HR APIs: attendance marking (`/api/staff/hr/attendance`), payroll & commission calculator (`/api/staff/hr/payroll`), hiring pipeline (`/api/staff/hr/recruitment`), and resignation/termination handler (`/api/staff/hr/exit`). (`DONE`)
- [x] V2-27: Implement comprehensive Salon HR Portal UI in `/dashboard/staff` with 7 dedicated tabs (HR Overview & Metrics, Staff 360° Profiles, Attendance Roster, Salary & Commissions, Hiring Kanban Board, Shifts, and Leaves) and modern dark luxury styling. (`DONE`)
- [x] V2-28: Automated QA verification (`scripts/test-staff-hr.mjs`) with 18 passing assertions, zero build regressions across 39 production routes. (`DONE`)

### 8.8 Targeted UI/UX Visual Improvements & Audit (Issues A, B, C)
- [x] V2-29: Issue A — Landing Page Header & Navigation Polish: clean 5-item desktop nav, prominent "Book Appointment" CTA button with calendar icon, owner badge access, and responsive mobile drawer at 390px. (`DONE`)
- [x] V2-30: Issue B — Light Theme for `/book` and `/staff/appointments`: replaced dark backgrounds (`#0d0b0a`, `#0f0f13`) with warm off-white (`#FDFBF8`), white cards, and accessible typography using existing design tokens. (`DONE`)
- [x] V2-31: Issue C — Contrast & Readability for `/dashboard/appointments` and `/dashboard/staff`: replaced dark card boxes (`rgba(26,23,22,0.7)`) and faint text (`#f7f5f0`, `#a8a29e`) with high-contrast surfaces (`#FFFFFF`), readable dark headings (`#2C2419`), and accessible status badges. (`DONE`)
- [x] V2-32: Visual verification via automated browser subagent screenshots and `next build` validation (all 39 routes compile cleanly in 22.8s, exit code 0). (`DONE`)

### 8.9 Salon Admin Operation Management & Customer Suite
- [x] V2-33: Reorganize Admin Panel sidebar into exact approved order: 6 Main Management Modules (Overview, Analytics, Appointment Management, Customer Management, Staff Management HR, Operation Management), subtle separator divider, and 5 Website Modules (Edit Website, Services, Enquiries, Support, Account). (`DONE` - `src/app/dashboard/DashboardShell.js`, `dashboard.module.css`)
- [x] V2-34: Build Customer Management directory (`/dashboard/customers`) powered by `public.customers` table, customer search & filter, VIP/Repeat badges, visit counts, WhatsApp/Call direct links, and client styling notes modal. (`DONE` - `src/app/dashboard/customers/page.js`)
- [x] V2-35: Build Salon Operation Management hub (`/dashboard/operations`) with 6 dedicated tabs: Operations Overview & readiness KPIs, Daily Opening & Closing Checklists with persistent browser state, Service Stations & Chair readiness, Operational Task Backlog with priority badges and modal, Salon Policies & Operating Hours, and Inventory & Supplies Roadmap preview. (`DONE` - `src/app/dashboard/operations/page.js`)
- [x] V2-36: Full visual and responsive verification via browser subagent (desktop 1523px and mobile 390px drawer) and production build validation (`next build` compiled 41 routes cleanly in 9.9s). (`DONE`)

## Blockers / Decisions Resolved

- Auth/onboarding: Resolved (Supabase Auth, default 'user' role, owner SQL promotion).
- Framework/backend/database: Resolved (Next.js 16 + Supabase DB + RLS).
- Persistent image storage: Configured for Supabase.
- Enquiry and support delivery: Resolved (Supabase `enquiries` and `support_requests` tables).
- Analytics provider/method: Resolved (Privacy-friendly first-party events table).
- Hosting/domain/budget: Ready for Vercel/Netlify free tier deployment with Supabase.
- V2 Architecture: Resolved in `PRD-V2.md` (Modular monolith, DB source of truth, no-payment MVP, snapshot immutability, async notification outbox).

