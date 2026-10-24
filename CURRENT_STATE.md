# Current System State & Baseline Audit (Pre-V1.5)

**Date of Audit:** 2026-10-24  
**Git Branch:** `fix/pre-v1.5`  
**Baseline Verification:** `npm run lint` PASSED (0 errors), `npm run build` PASSED (Production build successful).

---

## 1. Route & Page Verification Matrix

| Route | Functionality | Status | Notes |
|---|---|---|---|
| `/` (Home) | Hero, value proposition, featured services, gallery preview, CTAs | `VERIFIED` | HTTP 200, renders cleanly |
| `/services` | Filterable service list, categories, prices, durations | `VERIFIED` | HTTP 200, filter tabs work |
| `/about` | Story, values, stylist craft image | `VERIFIED` | HTTP 200 |
| `/gallery` | Responsive gallery showcase, category filters | `VERIFIED` | HTTP 200, images loaded |
| `/contact` | Contact details, opening hours, enquiry form submission | `VERIFIED` | HTTP 200, inserts to Supabase |
| `/login` | Email/password login via Supabase Auth | `VERIFIED` | HTTP 200 |
| `/signup` | User signup, role assigned 'user' by trigger | `VERIFIED` | HTTP 200 |
| `/account` | User display name update, password change, enquiry history | `NEEDS FIX` | HTTP 200; My Enquiries empty due to RLS policy (`FIX-03`) |
| `/dashboard` | Owner overview metrics and recent activity | `VERIFIED` | HTTP 200; Client-side auth redirect (`FIX-07`) |
| `/dashboard/edit` | Live split-screen CMS content editor, Save Draft & Publish | `VERIFIED` | HTTP 200, preview updates in real-time |
| `/dashboard/services` | Service manager CRUD, category filter, active toggle | `VERIFIED` | HTTP 200 |
| `/dashboard/enquiries` | Enquiry inbox with status management | `NEEDS FIX` | HTTP 200; Error state hidden on fetch/update failure (`FIX-06`) |
| `/dashboard/analytics` | Page views, visitor counts, CTA metrics | `VERIFIED` | HTTP 200 |
| `/dashboard/support` | Developer support request form | `VERIFIED` | HTTP 200 |
| `/dashboard/account` | Owner profile and password change | `VERIFIED` | HTTP 200 |

---

## 2. Security & RLS Audit

| Area | Current Behavior | Assessment | Issue Reference |
|---|---|---|---|
| `profiles` Table RLS | Users can update own profile with no column restriction | `CRITICAL / BLOCKED` | `FIX-01` (User can elevate role to 'owner') |
| Repo Hygiene | Hardcoded project details / email in `fix-rls.sql` | `NEEDS FIX` | `FIX-02` |
| `enquiries` RLS | Only owners can SELECT; public INSERT allowed | `NEEDS FIX` | `FIX-03` (Customers can't view own enquiries), `FIX-04` (Spam insert risk) |
| `analytics_events` RLS | Anyone can INSERT without constraints | `NEEDS FIX` | `FIX-04` |
| Contact Links & Fallbacks | Potential broken links if phone/map is placeholder or missing | `NEEDS FIX` | `FIX-05` |
| Owner Dashboard Protection | Client-side redirect in `layout.js` + DB RLS | `IMPLEMENTED — UNVERIFIED` | `FIX-07` |
| Legacy Auth API routes | `/api/auth/login` and `/signup` are unused stubs | `NEEDS FIX` | `FIX-08` |
| Documentation | Docs contain mismatched status or outdated notes | `NEEDS FIX` | `FIX-09` |

---

## 3. Baseline Audit Results
- **Lint Check:** Passed (0 warnings, 0 errors).
- **Production Build:** Passed (`next build` compiled all routes successfully).
- **Dev Server Status:** All 15 routes responding with HTTP 200 OK.
