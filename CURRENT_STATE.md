# Current System State & Audit (Pre-V1.5 Stabilized)

**Date of Audit:** 2026-10-24  
**Git Branch:** `fix/pre-v1.5`  
**Verification:** `npm run lint` PASSED (0 errors), `npm run build` PASSED (Production build successful).

---

## 1. Route & Page Verification Matrix

| Route | Functionality | Status | Notes |
|---|---|---|---|
| `/` (Home) | Hero, value proposition, featured services, gallery preview, CTAs | `VERIFIED` | HTTP 200, renders cleanly, fallbacks safe |
| `/services` | Filterable service list, categories, prices, durations | `VERIFIED` | HTTP 200, filter tabs work, active services only |
| `/about` | Story, values, stylist craft image | `VERIFIED` | HTTP 200, responsive layout verified |
| `/gallery` | Responsive gallery showcase, category filters | `VERIFIED` | HTTP 200, images loaded |
| `/contact` | Contact details, opening hours, enquiry form submission | `VERIFIED` | HTTP 200, safe links, rate limiter & honeypot active (`FIX-04`, `FIX-05`) |
| `/login` | Email/password login via Supabase Auth | `VERIFIED` | HTTP 200 |
| `/signup` | User signup, role assigned 'user' by trigger | `VERIFIED` | HTTP 200 |
| `/account` | User display name update, password change, enquiry history | `VERIFIED` | HTTP 200; Customer sees only own enquiries; explicit error handling (`FIX-03`) |
| `/dashboard` | Owner overview metrics and recent activity | `VERIFIED` | HTTP 200; Client-side redirect + database RLS protection (`FIX-07`) |
| `/dashboard/edit` | Live split-screen CMS content editor, Save Draft & Publish | `VERIFIED` | HTTP 200, preview updates in real-time |
| `/dashboard/services` | Service manager CRUD, category filter, active toggle | `VERIFIED` | HTTP 200 |
| `/dashboard/enquiries` | Enquiry inbox with status management | `VERIFIED` | HTTP 200; Explicit load error banner, retry button, optimistic status updates with rollback (`FIX-06`) |
| `/dashboard/analytics` | Page views, visitor counts, CTA metrics | `VERIFIED` | HTTP 200 |
| `/dashboard/support` | Developer support request form | `VERIFIED` | HTTP 200 |
| `/dashboard/account` | Owner profile and password change | `VERIFIED` | HTTP 200 |

---

## 2. Security & RLS Audit

| Area | Current Behavior | Assessment | Issue Reference |
|---|---|---|---|
| `profiles` Table RLS | Role self-promotion blocked via `prevent_role_change()` trigger | `VERIFIED` | `FIX-01` (Verified on live DB) |
| Repo Hygiene | Hardcoded credentials and email removed; strictly env-driven | `VERIFIED` | `FIX-02` (0 leaked secrets/emails) |
| `enquiries` RLS | Customer isolation via `user_id`; owners can read all; updates blocked | `VERIFIED` | `FIX-03` (Verified on live DB with two accounts) |
| Abuse Protection & Limits | DB CHECK constraints, in-memory rate limiter, and honeypot | `VERIFIED` | `FIX-04` (`sql/fix-04-database-limits-and-abuse-protection.sql`) |
| Contact Links & Fallbacks | Validated phone, whatsapp, mailto, and map links; neutral fallbacks | `VERIFIED` | `FIX-05` (`src/lib/contact.js`, Option A neutral placeholders) |
| Owner Dashboard Protection | Client-side redirect in `layout.js` + strict database RLS | `VERIFIED` | `FIX-07` (Verified via `scripts/test-non-owner-access.mjs`) |
| Legacy Auth API routes | Unused dummy `/api/auth/login` and `/signup` routes removed | `VERIFIED` | `FIX-08` (Deleted leftover stubs) |
| Documentation | Docs, tasks, and state trackers aligned with verified code | `VERIFIED` | `FIX-09` |

---

## 3. Baseline Audit Results
- **Lint Check:** Passed (0 warnings, 0 errors).
- **Production Build:** Passed (`next build` compiled all routes successfully).
- **Dev Server Status:** All 15 routes responding with HTTP 200 OK.
- **Automated Security Tests:** `scripts/test-non-owner-access.mjs` passed; RLS blocks non-owners from all owner resources.
