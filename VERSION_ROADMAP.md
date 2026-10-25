# Version Roadmap

**Current development target:** V2 — Phase 1: Appointment Booking Management MVP  
**Product:** Single-salon website and owner management application  
**Rule:** Only the active release PRD (`PRD-V2.md`) authorizes implementation.

## V1 — Existing Baseline

**Purpose:** Public salon website and basic owner management.
**Status:** Released (baseline preserved in `docs/archive/PRD-V1.md`).

Original requirements are preserved in `docs/archive/PRD-V1.md`.

## V1.5 — Quality, Usability and Reliability

**Purpose:** Quality, accessibility, responsiveness, email composer, CMS safety, and security hardening.
**Status:** Released on 2026-10-24 (Tagged `v1.5`). See `docs/archive/V1.5_RELEASE_REPORT.md` and `docs/archive/V1.5_PROGRESS.md`.

### In scope
- Preserve and regression-test existing V1 features.
- Mobile/responsive UX polish.
- Contact quick actions: WhatsApp link, call link, directions link, using verified business details.
- Enquiry inbox usability improvements.
- Reply-via-email composer using the user's default email app as the initial zero-setup option.
- CMS save-state, unsaved-change, validation, preview, and publish-confirmation improvements.
- Security, authorization, privacy, spam protection, and input validation audit/fixes.
- Loading, empty, success, and error states.
- SEO/local SEO verification and small fixes.
- Accessibility and performance polish.
- Basic privacy/terms pages if needed and approved.
- Optional manually managed testimonials only if time and genuine customer permission allow.
- Existing analytics readability improvements only; no new advanced analytics system.
- Document and test existing customer/owner account extras.

### Explicitly not part of V1.5
- Appointment calendar, booking engine, availability, cancellation, or rescheduling workflows.
- CRM, customer lifecycle, visit history, customer segmentation, or loyalty.
- Automated reminders or rebooking.
- WhatsApp automation or AI receptionist.
- Marketing campaigns or automated customer recovery.
- Automated review collection, review moderation, or review analytics.
- Revenue analytics, retention/cohort analytics, service profitability, or advanced attribution.
- Multi-salon tenancy, SaaS billing, staff management, inventory, or payments.

## V2 — Business Operations and Automation

**Status:** Active Development — Phase 1: Appointment Booking Management MVP  
**Authorizing PRD:** `PRD-V2.md`

### V2 Phased Implementation:
- **Phase 1 (Active Target):** Appointment Booking Management MVP (In-person appointments, staff scheduling, working hours, breaks, time off, availability calculation, double-booking prevention, mobile booking UI `/book`, owner calendar `/dashboard/appointments`, async notifications).
- **Phase 2 (Future):** Online payments, deposits, and refunds (Razorpay / UPI integration).
- **Phase 3 (Future):** WhatsApp notification automation & AI receptionist.
- **Phase 4 (Future):** Customer CRM, loyalty, visit history, and client segmentation.
- **Phase 5 (Future):** Marketing campaigns, automated review collection, and service profitability analytics.

## Release Rules

1. `docs/archive/PRD-V1.md` and `docs/archive/PRD-V1.5.md` remain the historical records of earlier releases; do not rewrite them.
2. `PRD-V2.md` is the only requirements document authorizing V2 changes.
3. Preserve existing V1/V1.5 data, routes, CMS capabilities, user permissions, and working behaviour.
4. Do not claim a feature is implemented or verified without inspecting and testing it.
5. Prefer additive, backward-compatible schema changes and the smallest safe implementation.
6. Update `CURRENT_STATE.md` after verified changes; update `TASKS.md` as task status changes.
