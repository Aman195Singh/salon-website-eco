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

All V2 Booking features are governed by `PRD-V2.md`. Implementation has not yet commenced.

| Area / Feature | Component / Table | Status | Detailed Notes |
|---|---|---|---|
| **Staff & Scheduling Schema** | `staff`, `staff_services`, `staff_working_hours`, `staff_breaks`, `staff_time_off` | `NOT IMPLEMENTED` | Design documented in `PRD-V2.md` §5. Awaiting Phase 8.1 database migration. |
| **Booking & Snapshot Schema** | `customers`, `appointments`, `appointment_services`, `appointment_events`, `notification_jobs` | `NOT IMPLEMENTED` | Schema, foreign keys, snapshots, and RLS documented in `PRD-V2.md` §5. |
| **Availability Engine** | `src/lib/booking/availability.js` | `NOT IMPLEMENTED` | Pure slot calculation, buffer, working hours, breaks, notice window (PRD-V2 §7). |
| **Double-Booking Prevention** | PostgreSQL constraint / serializable lock | `NOT IMPLEMENTED` | No-overlap rule on `[starts_at, ends_at)` (PRD-V2 §8). |
| **Customer Booking Journey** | `/book` (`src/app/book/page.js`) | `NOT IMPLEMENTED` | Mobile-first 8-step flow, 12 UI states, loading/empty/slot-taken/retry (PRD-V2 §3). |
| **Owner Booking Management** | `/dashboard/appointments` | `NOT IMPLEMENTED` | Calendar view, filterable list, status transitions, manual booking (PRD-V2 §2.4). |
| **Staff Schedule & Panel** | `/dashboard/staff`, `/staff/appointments` | `NOT IMPLEMENTED` | Staff schedule editor, daily client view (PRD-V2 §2.3). |
| **Async Notification Outbox** | Background worker / outbox processor | `NOT IMPLEMENTED` | Transactional outbox decoupling booking from SMS/email (PRD-V2 §10). |

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
