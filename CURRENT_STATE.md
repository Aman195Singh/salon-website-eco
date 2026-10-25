# Current System State & Audit — V2 Baseline

**Date of Audit:** 2026-10-25  
**Current Target:** V2 — Phase 1: Appointment Booking Management MVP (`PRD-V2.md`)  
**Git Baseline:** `main` (V1.5 Released, commit `86ac5dd`, Tag `v1.5`)  
**Baseline Verification:**
- `npm run lint`: Baseline recorded (`✖ 17 problems (12 errors, 5 warnings)`, Exit code 1). Rule: Zero new lint errors or warnings permitted.
- `npm run build`: Production build passes cleanly with all 21 static/dynamic routes compiled in 8.7s (Exit code 0).
- Security tests: `scripts/test-non-owner-access.mjs` passes (RLS blocks non-owners from all owner resources).
- Live Database: `sql/fix-01`, `sql/fix-03` (user_id policy), and `sql/fix-04` confirmed active by owner.

---

## 1. Feature & Route Audit Matrix

Status legend:
- `VERIFIED`: Tested and confirmed functioning in code and/or live environment.
- `IMPLEMENTED - UNVERIFIED`: Code is present, but needs full UI/UX test or human validation.
- `NEEDS FIX`: Present in basic form, but violates V1.5 requirements or lacks needed polish/states.
- `NOT IMPLEMENTED`: Feature required by V1.5 is missing from the codebase.
- `DEFERRED`: Explicitly postponed per PRD / owner direction.

| Area / Feature | Route / Component | Status | Detailed Audit Notes |
|---|---|---|---|
| **Home Page** | `/` (`src/app/page.js`) | `VERIFIED` | Server-rendered dynamic page. Hero, features, services preview, CTAs. Falls back to safe default content. LocalBusiness JSON-LD structured data and removed placeholder testimonials. |
| **About Page** | `/about` (`src/app/about/page.js`) | `VERIFIED` | Server-rendered dynamic page. Story, values, team sections. Safe fallback when CMS content empty. |
| **Services Page** | `/services` (`src/app/services/page.js`) | `VERIFIED` | Server-rendered dynamic page. Grouped categories, prices, durations, active services only. Dynamic CMS rendering verified. |
| **Gallery Page** | `/gallery` (`src/app/gallery/page.js`) | `VERIFIED` | Category filters, responsive image grid, accessible lightbox modal with Escape key listener. |
| **Contact Page** | `/contact` (`src/app/contact/page.js`) | `VERIFIED` | Contact info cards with validated links (`src/lib/contact.js`), form with honeypot & rate limiter, and error alerts. |
| **Customer Login** | `/login` (`src/app/login/page.js`) | `VERIFIED` | Supabase signInWithPassword. Branded loading state, robots noindex, customer redirects to `/account`. |
| **Customer Signup** | `/signup` (`src/app/signup/page.js`) | `VERIFIED` | User signup. Database trigger assigns 'user' role; robots noindex; explicit disclaimer that admin access requires approval. |
| **Customer Account** | `/account` (`src/app/account/page.js`) | `VERIFIED` | Name update, password change, customer enquiries isolated strictly by `user_id`. Error banner & retry. |
| **Owner Dashboard** | `/dashboard` (`src/app/dashboard/page.js`) | `VERIFIED` | Overview metrics and quick links. Client-side role redirect + database RLS protection. Robots noindex server layout. |
| **CMS Website Editor** | `/dashboard/edit` (`src/app/dashboard/edit/page.js`) | `VERIFIED` | Real-time live preview, beforeunload unsaved changes listener, save states (Saving, Saved, Save Failed, Unsaved, Published), publish confirm dialog, and inline field validation. |
| **Services Manager** | `/dashboard/services` (`src/app/dashboard/services/page.js`) | `VERIFIED` | Service CRUD and active toggle work. Additive idempotent schema. |
| **Enquiries Inbox** | `/dashboard/enquiries` (`src/app/dashboard/enquiries/page.js`) | `VERIFIED` | Search across all fields, date filtering (today/7/30 days/all), call/WhatsApp/email quick actions, zero-setup mailto composer, and fallback copy details. |
| **Analytics Dashboard** | `/dashboard/analytics` (`src/app/dashboard/analytics/page.js`) | `VERIFIED` | First-party metrics, date range filter (7d/30d/90d), descriptive metric subtitles, inquiry conversion percentage, and load error retry state. |
| **Developer Support** | `/dashboard/support` (`src/app/dashboard/support/page.js`) | `VERIFIED` | Support request submission and list. Policy enforces `submitted_by = auth.uid()`. |
| **Owner Account** | `/dashboard/account` (`src/app/dashboard/account/page.js`) | `VERIFIED` | Profile update and password reset for owner. |
| **Contact Quick Actions** | Header, Footer, Contact | `VERIFIED` | Validated tel:, wa.me, and maps links in Footer, Contact cards, and Enquiry cards via `src/lib/contact.js`. |
| **Email Reply Composer** | `/dashboard/enquiries` | `VERIFIED` | PRD §4.5 zero-setup `mailto:` modal/composer with editable subject/body, copy fallback, and non-presumptive delivery wording. |
| **Responsive Polish** | Global / All screens | `VERIFIED` | Polished at 320px, 375px, 768px, 1024px, 1440px. Chatbot positioning adjusted to avoid covering buttons on mobile. |
| **SEO & Discoverability** | Metadata, sitemap, robots | `VERIFIED` | Added `sitemap.xml`, `robots.txt`, `noindex` for private routes, Open Graph tags, and verified LocalBusiness JSON-LD (PRD §4.10). |
| **Accessibility (a11y)** | Global / All screens | `VERIFIED` | Added `@media (prefers-reduced-motion)`, visible `:focus-visible` rings, `<main id="main-content">` skip link, and accessible lightbox Escape handling. |
| **Legal Pages** | `/privacy`, `/terms` | `VERIFIED` | Privacy Policy and Terms of Service pages marked "Draft — Owner / Legal Review Needed", linked in Footer. |
| **Testimonials** | Site / CMS | `DEFERRED` | Owner confirmed no real testimonials exist; hardcoded placeholder reviews removed from home page. |

---

## 2. V2 Appointment Booking Status (Active Target)

All V2 Booking features are governed by `PRD-V2.md`. Customer booking journey and availability calculation are implemented and verified.

| Area / Feature | Component / Table | Status | Detailed Notes |
|---|---|---|---|
| **Staff & Scheduling Schema** | `staff`, `staff_services`, `staff_working_hours`, `staff_breaks`, `staff_time_off` | `VERIFIED` | Executed live in Supabase SQL Editor. Verified via `scripts/verify-all-tables.mjs`. |
| **Booking & Snapshot Schema** | `customers`, `appointments`, `appointment_services`, `appointment_events`, `notification_jobs` | `VERIFIED` | Executed live in Supabase SQL Editor. RLS policies active and verified via `scripts/test-booking-rls.mjs`. |
| **Availability Engine** | `src/lib/booking/availability.js` | `VERIFIED` | Pure slot calculation in IST, 2h notice, breaks exclusion, 10m buffer. Verified with `scripts/test-availability.mjs`. |
| **Double-Booking Prevention** | PostgreSQL constraint `no_staff_double_booking` & API slot lock | `VERIFIED` | `EXCLUDE USING gist` + atomic slot lock. Tested via `scripts/test-booking-concurrency.mjs`: 20 parallel requests yielded exactly 1 success (200), 19 conflict rejections (409), 0 crashes, and idempotent replay. |
| **Customer Booking Journey** | `/book` (`src/app/book/page.js`) | `VERIFIED` | 4-step wizard, interactive 30-day date picker, time slot grid, details form, confirmation reference card. Verified via automated browser subagent. |
| **Customer Self-Service Portal** | `/book/manage` (`src/app/book/manage/page.js`, `/api/booking/manage`) | `VERIFIED` | Secure reference + phone lookup, 4-hour cancellation policy lockout with WhatsApp emergency CTA, atomic reschedule slot picker (with max 2 changes abuse protection), cancellation with audit trail in `appointment_events`. Verified with `scripts/test-manage-booking.mjs` (6/6 tests passed). |
| **Customer Account Portal** | `/account` (`src/app/account/page.js`) | `VERIFIED` | "My Appointments" tab added for registered customers to view active/past bookings, schedule details in IST, status badge, and direct link to self-service manage portal (PRD-V2 §2.2). |
| **Staff Chair-Side Portal** | `/staff/appointments` (`src/app/staff/appointments/page.js`) | `VERIFIED` | Mobile-first stylist schedule view with date and specialist selector, client details, notes, and one-tap status updates (`arrived`, `in_service`, `completed`, `no_show`) without owner revenue disclosure (PRD-V2 §2.3). |
| **Owner Booking Management** | `/dashboard/appointments` | `VERIFIED` | Calendar filtering, search by name/phone/reference, status transitions (Arrived, In-Service, Completed, Cancelled), quick WhatsApp/Call links, and Walk-In / Phone Client Manual Booking Modal. Verified via `scripts/test-walkin-booking.mjs` (4/4 tests passed). |
| **Staff Schedule & Panel** | `/dashboard/staff`, `/api/staff`, `/api/staff/schedule`, `/api/staff/time-off` | `VERIFIED` | Specialist directory, active status toggles, 7-day working hours & shift editor, recurring lunch breaks, and planned absence scheduling. Verified via `scripts/test-staff-management.mjs` (5/5 tests passed). |
| **Salon HR & Workforce Suite** | `/dashboard/staff`, `/api/staff/hr/*` | `VERIFIED` | Full HR lifecycle: 360° Profiles, Attendance in/out roster, Base + Commission payroll calculator, Recruitment Kanban board, and Resignation/Termination with auto-schedule deactivation. Verified via `scripts/test-staff-hr.mjs` (18/18 tests passed). |
| **Async Notification Outbox** | Background worker / outbox processor | `VERIFIED` | `src/lib/booking/outbox-processor.js`, `/api/booking/notifications`, `/api/booking/notifications/process`. Tested via `scripts/test-notification-outbox.mjs`: WhatsApp/SMS/Email templates, batch processing, retry backoff (1m, 5m, 15m), dead-letter queue, and transactional decoupling (6/6 passed). |
| **Light Theme Consistency (Issue B)** | `/book`, `/staff/appointments` | `VERIFIED` | Replaced legacy dark backgrounds (`#0d0b0a`, `#0f0f13`) with luxury warm off-white (`#FDFBF8`), white cards, and accessible typography using core design tokens. Verified in browser subagent. |
| **Header & Nav Polish (Issue A)** | Header, desktop nav, mobile drawer | `VERIFIED` | Uncluttered 5-link navigation (Home, Services, About, Gallery, Contact), prominent "Book Appointment" CTA button with calendar icon, owner badge access, and responsive mobile drawer at 390px. Verified in browser subagent. |
| **Dashboard Contrast & Readability (Issue C)** | `/dashboard/appointments`, `/dashboard/staff` | `VERIFIED` | Replaced dark-mode cards (`rgba(26,23,22,0.7)`) and white headings (`#f7f5f0`) with high-contrast surfaces (`#FFFFFF`), readable dark headings (`#2C2419`), accessible status pills, and dark green/red indicators. Verified in browser subagent. |
| **Admin Panel Sidebar Architecture** | `/dashboard/*` (`DashboardShell.js`) | `VERIFIED` | Exact 11-item hierarchy: 6 Main Management items (Overview, Analytics, Appointments, Customers, Staff HR, Operations), subtle divider, and 5 Website modules (Edit Website, Services, Enquiries, Support, Account). Peach highlight with bronze left accent line. Verified in browser. |
| **Customer Management Directory** | `/dashboard/customers` | `VERIFIED` | Direct client directory populated from Supabase `customers` table with local fallback, search & filter pills, VIP badge indicators, WhatsApp/call links, and client styling notes modal. Verified in browser. |
| **Salon Operation Management Hub** | `/dashboard/operations` | `VERIFIED` | 6 operational sub-modules: Operations Overview, Daily Checklists (opening/closing), Service Stations (4 chairs + stylist portal link), Operational Tasks backlog, Salon Policies & Rules, and Inventory Roadmap Preview with clear Phase 2 badge. Verified in browser. |

---

## 3. Security & RLS Matrix

| Security Domain | Mechanism | Status | Evidence / Notes |
|---|---|---|---|
| Role Escalation Protection | Database trigger `prevent_role_change()` on `profiles` | `VERIFIED` | `sql/fix-01-prevent-role-escalation.sql` tested on live DB. |
| Customer Enquiry Isolation | RLS policy `user_id = auth.uid()` | `VERIFIED` | `sql/fix-03-customer-enquiries-rls.sql` tested with two customer accounts. |
| Abuse & Spam Protection | DB CHECK constraints, in-memory rate limiter, honeypot | `VERIFIED` | `sql/fix-04-database-limits-and-abuse-protection.sql` executed by owner. |
| Credential & Repo Privacy | No hardcoded keys/emails in tracked files; GitHub repo Private | `VERIFIED` | Searched code for `@gmail`, `supabase.co`, `eyJ`. Private repo confirmed by owner. |
| Non-Owner Dashboard Access | RLS blocks all data queries; client redirect | `VERIFIED` | Tested via `scripts/test-non-owner-access.mjs`. |

---

## 4. Manual Regression Test Checklist

1. [ ] **Public Navigation & Pages:**
   - Home (`/`), About (`/about`), Services (`/services`), Gallery (`/gallery`), Contact (`/contact`) render cleanly on mobile (320px) and desktop (1440px).
2. [ ] **Contact Actions:**
   - `tel:` links call real numbers (not empty/broken).
   - `https://wa.me/` links open international number chats.
   - Map link opens Google Maps in a new tab.
   - Form submits enquiry, displays success message, resets form, and respects rate limit.
3. [ ] **Customer Flow:**
   - Log in as customer → redirects to `/account`.
   - Update full name → persists on refresh.
   - "My Enquiries" loads customer's submitted enquiries with accurate status.
   - Log out → session cleared, redirected to `/login`.
4. [ ] **Owner Flow:**
   - Log in as owner → opens `/dashboard`.
   - `/dashboard/enquiries`: Search by name/email/message, filter by status, filter by date (today/7d/30d/all), update status, open email reply composer.
   - `/dashboard/edit`: Modify content fields, check live preview, trigger beforeunload warning on navigate, save draft, confirm publish dialog.
   - `/dashboard/services`: Create, edit, toggle active status, and delete services.
   - `/dashboard/analytics`: Check page views and CTA clicks with date range filters.
5. [ ] **Security Non-Owner Verification:**
   - Run `node --env-file=.env.local scripts/test-non-owner-access.mjs` to ensure non-owners cannot read enquiries, drafts, or analytics.
