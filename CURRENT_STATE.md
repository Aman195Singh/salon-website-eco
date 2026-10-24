# Current System State & Audit — V1.5 Baseline

**Date of Audit:** 2026-10-24  
**Git Branch:** `feature/v1.5`  
**Baseline Verification:**
- `npm run lint`: Known baseline issues present (`✖ 17 problems (12 errors, 5 warnings)`, Exit code 1). Main had 10 errors / 4 warnings; fix branch added 3 issues in `account/page.js` and `contact/page.js`. **Rule: No new lint errors or warnings may be added during V1.5.**
- `npm run build`: Production build passes cleanly with `/`, `/about`, `/services` dynamic (`ƒ`) and all 17 routes building successfully.
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
| **Home Page** | `/` (`src/app/page.js`) | `VERIFIED` | Server-rendered dynamic page. Hero, features, services preview, CTAs. Falls back to safe default content. |
| **About Page** | `/about` (`src/app/about/page.js`) | `VERIFIED` | Server-rendered dynamic page. Story, values, team sections. Safe fallback when CMS content empty. |
| **Services Page** | `/services` (`src/app/services/page.js`) | `VERIFIED` | Server-rendered dynamic page. Grouped categories, prices, durations, active services only. |
| **Gallery Page** | `/gallery` (`src/app/gallery/page.js`) | `VERIFIED` | Category filters, responsive image grid, lightbox modal. |
| **Contact Page** | `/contact` (`src/app/contact/page.js`) | `VERIFIED` | Contact info cards with validated links (`src/lib/contact.js`), form with honeypot & rate limiter. |
| **Customer Login** | `/login` (`src/app/login/page.js`) | `IMPLEMENTED - UNVERIFIED` | Supabase signInWithPassword. Has basic error alert, but lacks polished loading/empty/error states. |
| **Customer Signup** | `/signup` (`src/app/signup/page.js`) | `IMPLEMENTED - UNVERIFIED` | User signup. Database trigger assigns 'user' role; lacks rich error feedback. |
| **Customer Account** | `/account` (`src/app/account/page.js`) | `VERIFIED` | Name update, password change, customer enquiries isolated by `user_id`. Explicit error banner & retry. |
| **Owner Dashboard** | `/dashboard` (`src/app/dashboard/page.js`) | `VERIFIED` | Overview metrics and quick links. Client-side role redirect + database RLS protection. |
| **CMS Website Editor** | `/dashboard/edit` (`src/app/dashboard/edit/page.js`) | `NEEDS FIX` | Basic split-screen editor exists; lacks `Saving`/`Saved`/`Unsaved changes`/`Save failed` states, beforeunload warning, and publish confirmation dialog (PRD §4.6). |
| **Services Manager** | `/dashboard/services` (`src/app/dashboard/services/page.js`) | `IMPLEMENTED - UNVERIFIED` | Service CRUD and active toggle work. Lacks delete confirmation and inline field validation. |
| **Enquiries Inbox** | `/dashboard/enquiries` (`src/app/dashboard/enquiries/page.js`) | `NEEDS FIX` | Has status filter and error banner (`FIX-06`). Lacks search, date filtering (today/7/30 days/all), responsive detail view/cards, and email reply composer (PRD §4.4, §4.5). |
| **Analytics Dashboard** | `/dashboard/analytics` (`src/app/dashboard/analytics/page.js`) | `NEEDS FIX` | Basic event counts shown; lacks date range filter, readable metric descriptions, and loading/empty states (PRD §4.13). |
| **Developer Support** | `/dashboard/support` (`src/app/dashboard/support/page.js`) | `VERIFIED` | Support request submission and list. Policy enforces `submitted_by = auth.uid()`. |
| **Owner Account** | `/dashboard/account` (`src/app/dashboard/account/page.js`) | `VERIFIED` | Profile update and password reset for owner. |
| **Contact Quick Actions** | Header, Footer, Contact | `NEEDS FIX` | Contact page has cards; Header/Footer need polish for valid mobile quick actions (wa.me, tel:, maps) without broken links (PRD §4.3). |
| **Email Reply Composer** | `/dashboard/enquiries` | `NOT IMPLEMENTED` | PRD §4.5 zero-setup `mailto:` modal/composer with editable subject/body, copy fallback, and non-presumptive delivery wording. |
| **Responsive Polish** | Global / All screens | `NEEDS FIX` | Audit needed at 320px, 375px, 768px, 1024px, 1440px. Chatbot positioning can cover mobile buttons. |
| **SEO & Discoverability** | Metadata, sitemap, robots | `NOT IMPLEMENTED` | Missing `sitemap.xml`, `robots.txt`, `noindex` for private routes, Open Graph tags, and verified LocalBusiness JSON-LD (PRD §4.10). |
| **Accessibility (a11y)** | Global / All screens | `NEEDS FIX` | Needs visible focus styles, aria labels, dialog accessibility, contrast checks, reduced-motion support (PRD §4.9). |
| **Legal Pages** | `/privacy`, `/terms` | `NOT IMPLEMENTED` | Privacy Policy and Terms of Service pages marked "draft - owner/legal review needed", linked in footer (PRD §4.11). |
| **Testimonials** | Site / CMS | `DEFERRED` | Owner confirmed no real testimonials exist; fake ones strictly forbidden (PRD §4.12). |

---

## 2. Security & RLS Matrix

| Security Domain | Mechanism | Status | Evidence / Notes |
|---|---|---|---|
| Role Escalation Protection | Database trigger `prevent_role_change()` on `profiles` | `VERIFIED` | `sql/fix-01-prevent-role-escalation.sql` tested on live DB. |
| Customer Enquiry Isolation | RLS policy `user_id = auth.uid()` | `VERIFIED` | `sql/fix-03-customer-enquiries-rls.sql` tested with two customer accounts. |
| Abuse & Spam Protection | DB CHECK constraints, in-memory rate limiter, honeypot | `VERIFIED` | `sql/fix-04-database-limits-and-abuse-protection.sql` executed by owner. |
| Credential & Repo Privacy | No hardcoded keys/emails in tracked files; GitHub repo Private | `VERIFIED` | Searched code for `@gmail`, `supabase.co`, `eyJ`. Private repo confirmed by owner. |
| Non-Owner Dashboard Access | RLS blocks all data queries; client redirect | `VERIFIED` | Tested via `scripts/test-non-owner-access.mjs`. |

---

## 3. Manual Regression Test Checklist

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
