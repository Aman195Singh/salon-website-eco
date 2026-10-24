# Version Roadmap

**Current development target:** V1.5  
**Product:** Single-salon website and owner management application  
**Rule:** Only the active release PRD authorizes implementation.

## V1 — Existing Baseline

**Purpose:** Public salon website and basic owner management.

Original requirements are preserved in `PRD-V1.md`.

Reported functionality includes public pages, owner dashboard/CMS, enquiries, basic analytics, FAQ chatbot, developer support, and extra account functionality. See `CURRENT_STATE.md`; reported does not mean verified.

**Status:** Built according to the owner; source-code and runtime verification is pending in this documentation package.

## V1.5 — Quality, Usability and Reliability

**Purpose:** Improve the existing V1 without replacing it or expanding into a business operations platform.

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

**Status:** Planned only. Do not implement as part of V1.5.

The owner's high-level V2 direction:
- Booking Management System.
- Customer Management System.
- Booking reminder system.
- Marketing system.
- Service review and feedback system.
- Edge-case handling across these workflows.
- Analytics visualizations for these systems, added to the admin analytics area.

Detailed V2 workflows, data model, permissions, integrations, edge cases, and acceptance criteria will be designed in `PRD-V2.md` when V2 planning begins.

## Release Rules

1. `PRD-V1.md` remains the historical record of original V1 requirements; do not rewrite it to describe V1.5.
2. `PRD-V1.5.md` is the only requirements document authorizing V1.5 changes.
3. V2 items are not implementation instructions for V1.5.
4. Preserve existing data, routes, user permissions, and working behaviour unless an approved change explicitly requires otherwise.
5. Do not claim a feature is implemented or verified without inspecting and testing it.
6. Prefer additive, backward-compatible changes and the smallest safe implementation.
7. Update `CURRENT_STATE.md` after verified changes; update `TASKS.md` as task status changes.
8. Create `PRD-V2.md` only when V2 planning is authorized.
