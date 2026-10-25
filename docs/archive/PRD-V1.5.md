# Product Requirements Document — Salon Website V1.5

**Status:** Proposed scope for approval before implementation  
**Release type:** Backward-compatible improvement release  
**Current target:** V1.5  
**Primary source:** Existing application + `PRD-V1.md` + `CURRENT_STATE.md`  
**Audience:** Solo beginner developer and AI coding agent

## 1. Purpose

Improve the existing V1 salon website and owner dashboard so they are easier to use, more reliable, secure, accessible, and ready for a real-salon pilot.

V1.5 is not V2. It must not introduce booking management, CRM, reminders, marketing automation, automated reviews, or advanced business analytics.

## 2. Non-Negotiable Compatibility Requirements

- Do not rebuild the app from scratch.
- Do not remove existing pages, features, routes, account flows, or dashboard sections without explicit approval.
- Do not silently change the current technology stack, auth/database/storage providers, or deployment architecture.
- Preserve existing customer, enquiry, content, and analytics data.
- Prefer additive schema changes. Any required migration must be reviewed, tested, and have a backup/recovery plan.
- Preserve existing URLs and API contracts where feasible. If a change is unavoidable, provide compatibility or a documented migration.
- Keep the CMS limited to predefined content fields; no arbitrary HTML, scripts, CSS, or page-layout editing.
- Do not grant owner privileges through public signup.
- Protect owner-only pages and server operations with server-side authorization.
- Do not introduce paid services or external accounts without explaining the cost, free-tier limits, and obtaining owner approval.
- Avoid unrelated refactoring and unnecessary dependencies.
- Existing functionality must pass regression tests before release.
- Do not mark any feature complete unless its acceptance criteria are verified.

## 3. Preserve Existing V1 Features

The following are preservation requirements based on the owner's description. Audit the actual code and mark status in `CURRENT_STATE.md` before making changes:

- Public pages: Home, Services, About, Gallery, Contact, Login, Signup.
- Owner dashboard and existing navigation.
- Existing CMS editor, live preview, save/draft/publish workflow.
- Enquiry submission, listing, search/filter where implemented, and statuses: `New`, `In Progress`, `Resolved`.
- Existing analytics and tracking.
- Rule-based FAQ chatbot and quick chips.
- Customer `/account` page and existing profile/password functionality.
- Customer access to their own enquiries and statuses.
- Owner `/dashboard/account` page.
- Developer support functionality if present in the application.

Do not assume any item is verified solely because it is listed here.

## 4. V1.5 Scope

### P0 — Must have

#### 4.1 Baseline audit and regression safety
- Inspect the real application before edits.
- Record implemented, unverified, missing, and broken features in `CURRENT_STATE.md`.
- Create a Git checkpoint/branch before significant changes, if Git is configured.
- Test the existing critical flows before and after changes.
- Fix regressions caused by V1.5 work.

#### 4.2 Responsive UX polish
- Check public pages and dashboard at narrow mobile, typical mobile, tablet, laptop, and desktop widths.
- Fix overflow, clipped content, overlapping controls, unreadable text, and broken navigation.
- Keep the CMS editor/preview usable on narrow screens through stacking or accessible tabs.
- Keep chatbot controls from obscuring important mobile actions.

#### 4.3 Contact quick actions
- Add or polish WhatsApp, telephone, and directions links where the corresponding verified salon details exist.
- Use `https://wa.me/` with a correctly formatted phone number where appropriate, `tel:` for calls, and a verified maps/directions URL.
- Do not invent contact details or display empty/broken actions.
- These are manual links only. No WhatsApp API, automation, AI agent, or booking flow.

#### 4.4 Enquiry inbox usability
- Preserve existing enquiry records, status meanings, and access restrictions.
- Improve search, status/date filtering, enquiry detail readability, and responsive presentation where needed.
- Provide clear loading, empty, success, and error states.
- Provide call/WhatsApp/email actions only when valid contact data exists.
- Do not add CRM features, customer scoring, segmentation, visit history, or automated follow-ups.

#### 4.5 Reply via Email — zero-setup first option
- Provide a reply composer from an enquiry when the customer has a valid email address.
- Prefill recipient and a sensible subject; allow the owner to edit the message.
- Provide an explicit action such as `Open Email App` that creates a `mailto:` link with encoded recipient, subject, and body.
- Do not imply that the email has been sent merely because the email application was opened.
- Do not automatically mark an enquiry `Resolved` when opening the email application.
- Allow the owner to cancel without modifying the enquiry.
- If the email client cannot be opened or required information is missing, show a clear message and a safe fallback (copy email details or edit the enquiry manually).
- Initial implementation must not require an external email service or API key.
- Direct backend email sending (for example, through an email provider) is explicitly deferred unless separately approved.

#### 4.6 CMS usability and safe publishing
- Clearly show `Saving`, `Saved`, `Unsaved changes`, and `Save failed` states where relevant.
- Warn before leaving an editor with unsaved changes, using a non-intrusive and reliable pattern.
- Require deliberate confirmation before publishing if not already present.
- Preserve the existing distinction between draft and published content.
- Show validation messages near invalid fields.
- Validate image type and size, and show preview/error states where upload functionality exists.
- Do not promise content version history or rollback unless it exists and is tested.

#### 4.7 Security, privacy and spam protection
- Audit authentication, authorization, owner-only routes, server actions/API handlers, and database access policies.
- Ensure public signup cannot grant owner privileges.
- Validate untrusted form/content data on the server as well as client-side.
- Add reasonable rate limiting/spam protection to public enquiry/support forms where compatible with the existing stack.
- Verify file upload type/size restrictions and safe storage behaviour.
- Keep secrets out of source control, client bundles, public assets, logs, and documentation.
- Do not expose private enquiry details in analytics events.
- Collect only necessary personal information.
- Do not add a new tracking provider without approval and an appropriate privacy notice.

#### 4.8 Error and status states
For existing data-driven flows, show useful loading, empty, success, and error states. At minimum, inspect login/account actions, enquiry submission and status updates, CMS saving/publishing, image uploads, analytics, and chatbot fallback behaviour.
- Errors must not silently discard edits or claim success when an operation failed.
- Messages should be understandable to a non-technical salon owner.

#### 4.9 Accessibility and performance
- Check semantic HTML, labels, keyboard navigation, visible focus, contrast, alt text, reduced-motion preferences, and accessible menus/dialogs.
- Fix obvious performance issues such as unnecessarily large images and avoidable loading delays.
- Avoid broad redesign or unnecessary dependency additions.

#### 4.10 SEO and local discoverability
- Audit existing title/description metadata, canonical URLs, Open Graph tags, favicon, sitemap, robots rules, image alt text, and heading structure.
- Ensure public pages can be indexed as intended and private dashboard/account pages are not indexed.
- Add/repair salon local-business structured data only using verified business details.
- Do not promise search ranking outcomes.
- Avoid duplicating SEO functionality that already works.

### P1 — Recommended if time and genuine content are available

#### 4.11 Basic legal pages
- Add simple Privacy Policy and Terms pages if needed for the implemented data handling and website use.
- Ensure policy wording reflects actual data collection, analytics, and providers; do not invent compliance claims.
- Link them from the footer where appropriate.

#### 4.12 Manual testimonials
- Optional owner-managed testimonials only if genuine customer-approved content is available.
- Owner can add/edit/show/hide a testimonial using the existing safe CMS pattern if practical.
- No automatic review requests, review collection, review moderation workflow, or review analytics.
- Do not create fake reviews or invented ratings.

#### 4.13 Existing analytics readability
- Improve metric labels, date-range controls, loading/empty/error states, and chart readability only where appropriate.
- Preserve current metric definitions and tracking behaviour unless a documented correction is approved.
- Do not add revenue, booking, retention, cohort, customer-lifecycle, marketing-attribution, or service-profitability analytics.

## 5. Explicitly Out of Scope — Reserve for V2 or Later

- Appointment booking calendar, availability/slot engine, cancellation, rescheduling.
- Customer CRM, visit history, segmentation, loyalty, customer lifecycle, customer scoring.
- Automated booking reminders, payment reminders, rebooking, inactive-customer recovery.
- WhatsApp automation, AI receptionist, messaging workflow automation.
- Marketing campaigns, coupons engine, automated lead nurturing.
- Automated service review/feedback collection, moderation, review workflows, review analytics.
- Booking/customer/revenue/retention/marketing advanced analytics.
- Multi-salon tenancy, SaaS billing, staff management, inventory, payroll, online payments.
- Direct backend email sending through Resend/Brevo/SMTP; requires separate approval and provider setup.

## 6. Technical and UX Constraints

- Follow existing framework conventions and `DESIGN.md`.
- Keep interfaces beginner-friendly and consistent with the current site.
- Do not make the owner learn a complex new workflow.
- Reuse existing components and services where sensible.
- No provider or paid service may be added silently.
- Do not invent salon name, address, prices, opening hours, testimonials, or contact details.
- Do not change database schema unless necessary; document the reason and migration plan first.

## 7. Acceptance Criteria

V1.5 may be released only when:

### Compatibility
- [ ] All verified V1 critical features still work.
- [ ] Existing records remain present and readable.
- [ ] Existing public URLs and dashboard navigation still work, or approved changes are documented.
- [ ] Customer can only access their own enquiry data.
- [ ] Owner-only pages and operations reject unauthorized access.
- [ ] Draft content does not appear publicly before publishing.
- [ ] No unapproved V2 feature has been introduced.

### New/improved behaviour
- [ ] Responsive layouts checked on mobile, tablet, and desktop.
- [ ] Valid contact quick actions work and missing details do not create broken links.
- [ ] Enquiry inbox search/filter/detail/status flows work as implemented.
- [ ] Reply composer validates email address and prepopulates editable fields.
- [ ] Opening an email app is not represented as confirmed delivery.
- [ ] Reply preparation does not automatically mark an enquiry `Resolved`.
- [ ] CMS warns about unsaved changes and accurately reports save/publish outcomes.
- [ ] Relevant forms and data-driven screens have meaningful loading, empty, success, and error states.
- [ ] Security and input validation checks have been performed.
- [ ] SEO/indexing rules are correct for public versus private pages.
- [ ] Accessibility and obvious performance issues have been checked.
- [ ] Legal pages/testimonials are included only if approved and properly sourced.

### Release verification
- [ ] Run only the lint/type-check/test/build commands available in the actual project and record results.
- [ ] Manually test login/logout, protected routes, CMS edit/preview/save/publish, enquiries, customer account, chatbot, analytics, and contact actions.
- [ ] Test a production build and the deployment environment.
- [ ] Record unresolved issues and limitations.
- [ ] Update `CURRENT_STATE.md`, `TASKS.md`, and `README.md` to reflect verified facts.
- [ ] Confirm a backup/checkpoint and rollback approach for the release.

## 8. Suggested Implementation Order

1. Audit source code, environment, existing features, and available tests.
2. Record baseline behaviour and create a safe Git checkpoint.
3. Fix critical regressions/security problems first.
4. Improve responsive layouts and shared UI states.
5. Improve enquiry inbox and implement the zero-setup email reply composer.
6. Improve CMS status, validation, and publishing UX.
7. Polish contact actions, SEO, accessibility, and performance.
8. Add approved P1 items only if time and real content allow.
9. Run regression tests and manually verify critical flows.
10. Update project documentation and report remaining issues.

## 9. Decisions and Notes

- **Email approach:** Option 1 (`mailto:` / default email app) is the proposed initial choice; no backend email service.
- **Testimonials:** Optional; only real, permissioned testimonials.
- **Analytics:** Improve existing UX only; no new analytics provider or advanced business metrics.
- **Budget:** Free-first; provider limits must be checked before any new integration.
- **Scope approval:** This document is proposed scope until the owner approves it.
