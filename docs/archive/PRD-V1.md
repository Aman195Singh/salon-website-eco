# Product Requirements Document — Salon Website V1

**Status:** Updated draft for owner approval  
**Release:** V1  
**Product:** Public salon website + single-salon owner management web app  
**Primary users:** Public visitors/customers, authorized salon owner, developer/support contact  
**Important:** This document supersedes the earlier V1 scope. V1 is no longer a public website only. It includes authentication, content management, analytics, enquiry management, a simple FAQ chatbot, and developer support. Confirm the open decisions in Section 15 before implementation.

## 1. Product Goal

Build a professional, responsive salon website that visitors can use to learn about the salon and its services, and provide an authorized salon owner with a simple, safe way to update salon information without changing the website's underlying structure or writing code.

## 2. Users and Access

### 2.1 Public visitor / potential customer
Can browse the public website, view published content, use contact links, submit an enquiry where configured, and use the FAQ chatbot.

### 2.2 Salon owner
Can sign in to a protected owner dashboard, edit approved content fields, preview changes, publish changes, review enquiries, and see basic analytics. The owner must not be able to change the website's layout or code through the CMS.

### 2.3 Developer / support
Receives support or feature requests through the developer contact flow. V1 does not require a separate developer admin portal unless explicitly approved.

### 2.4 Authentication safety
The login page may be publicly accessible. Signup must **not automatically grant owner privileges**. For a single-salon pilot, owner access must be provisioned through a controlled method (for example, an invitation or manually approved account). Do not allow any visitor to create an account and immediately become the salon owner. Password reset and secure logout are required if supported by the chosen authentication service.

## 3. Public Website

Required pages:

1. **Home (`/`)**
   - Hero with salon name, value proposition, image, and primary contact CTA.
   - Salon introduction, featured services, gallery preview, and contact/location CTA.
2. **Services (`/services`)**
   - Service name, description, price, duration, and category where applicable.
   - Service details and policies when configured by the owner.
3. **About (`/about`)**
   - Salon story, description, logo/branding, and team/highlights where provided.
4. **Gallery (`/gallery`)**
   - Responsive gallery of approved salon/service images.
5. **Contact (`/contact`)**
   - Phone, address, opening hours, social links, map link, and enquiry option when configured.
6. **Login (`/login`)**
   - Secure login for authorized owners.
7. **Signup (`/signup`)**
   - Account registration only if the selected onboarding model requires it. Registration alone must not grant owner access. If open signup is unnecessary for the pilot, show a controlled invitation/registration flow instead.

All public pages must display **published** content only.

## 4. Owner Dashboard and Content Management (CMS)

### 4.1 Dashboard access
- Protected routes require an authenticated, authorized owner.
- Public visitors must not access owner-only data or editing functions.
- The V1 pilot supports one salon and one owner role unless a different access model is explicitly approved.

### 4.2 Page editor with live preview
Provide an editing interface split into two areas on desktop:
- **Left:** structured form controls for the selected page/section.
- **Right:** live preview of the same page showing unsaved edits.

On smaller screens, stack the editor and preview or provide a clear switch between them. The editor must remain usable on mobile/tablet.

### 4.3 Editable content
The owner may edit only predefined fields and content blocks, including:
- Salon name, tagline, description, logo, and approved images.
- Home page headings, text, hero image, featured services, and contact CTA content.
- About page text and approved images.
- Service categories, service names, descriptions, prices, durations, and service-specific policies.
- Contact details, address, opening hours, map link, phone/WhatsApp/email links, and social media URLs.
- Gallery images, captions, and display order where supported.

### 4.4 Structural boundaries
- The CMS is **not** a drag-and-drop website builder.
- The owner cannot create arbitrary pages, change layout structure, edit code, inject scripts/HTML, or change global design tokens.
- Page templates and components remain controlled by the application.
- Validate and sanitize editable inputs. Restrict image uploads by file type and size.

### 4.5 Save, preview, and publish
- `Preview` shows the current editing state, including unsaved changes.
- `Save Draft` stores changes without changing the public website.
- `Publish Changes` makes the saved approved content live after confirmation.
- The dashboard must clearly distinguish draft content from published content.
- Provide a basic way to restore the last published content if practical within the selected data model; if not implemented, document the limitation and do not promise version history.
- Public pages must not accidentally show draft content.

## 5. Enquiries and Visitor/Customer Dashboard

### 5.1 Enquiry management
- Store contact/enquiry submissions in a protected data store.
- Show a list with submitted date, name, contact method, message, and status.
- Statuses: `New`, `In Progress`, `Resolved`.
- Provide basic search/date filtering and export only if feasible and approved.
- Validate inputs server-side, protect against spam, and restrict access to authorized owners.
- Collect only information needed to respond to the enquiry.

### 5.2 Analytics dashboard
Show a small, understandable set of metrics:
- Page views over time.
- Total visits or visitors using a clearly documented counting method.
- Most-viewed pages.
- Contact CTA clicks.
- Enquiry submissions.
- Traffic source/referrer only where available and collected appropriately.

Do not label all website visitors as customers. Analytics and identifiable enquiry records must remain separate. Avoid collecting unnecessary personal data. Provide an appropriate notice/consent approach if required by the selected analytics implementation and applicable law. Explain limitations of counts (for example, blockers, repeat visits, or missing referrers).

## 6. Simple FAQ Chatbot

- Provide a floating chat launcher on public pages.
- Answer configured FAQs about services, prices, opening hours, location, and contact details using approved published business information.
- If the answer is unknown, do not invent an answer; direct the visitor to the contact/enquiry method.
- V1 chatbot is rule-based or FAQ-search based. No AI model, paid API, WhatsApp automation, or appointment booking is required.
- Make it clear that the chatbot is automated and provide an accessible way to close it.

## 7. Connect to Developer / Support

- Provide a developer/support page or dashboard section with a support request form.
- Capture a short subject, description, request type, and optional screenshot if file upload is implemented safely.
- Show the submitter a clear success/error state.
- Allow the owner to see their submitted requests and status if that is part of the agreed workflow.
- V1 does not require live chat or a full ticketing platform.
- Before implementation, decide where requests are stored and how the developer will receive them. Do not show a false “sent” success if no submission endpoint exists.

## 8. Media Management

- Owner can upload and preview logo/gallery/service images if supported by the chosen storage service.
- Restrict allowed image formats and file size; validate on the server.
- Use safe file names and do not expose storage credentials.
- Provide a clear upload error and a way to replace/remove an image.
- If persistent uploads are not feasible on the chosen free-first hosting setup, decide on an approved alternative before implementation. Do not rely on temporary local filesystem storage in production without verifying platform persistence.

## 9. SEO and Sharing

- Accurate page titles and meta descriptions.
- Open Graph/social-sharing metadata where appropriate.
- Sitemap and robots configuration where supported.
- Public pages should be indexable as appropriate; login/dashboard pages should not be indexed.
- Do not expose private content or drafts in public metadata.

## 10. Non-Functional Requirements

- Responsive layouts for mobile, tablet, and desktop.
- Semantic HTML, keyboard navigation, visible focus, labels, alt text, and adequate contrast.
- Secure authentication and authorization; server-side access checks for protected operations.
- Server-side validation for all submitted/edited data.
- Secrets kept in environment variables or provider secret storage, never in source control or public assets.
- Graceful loading, empty, error, and success states.
- Avoid unnecessary dependencies and paid services; check free-tier limits before choosing a provider.
- Production build and available lint/type checks must pass before release.
- Test the most important public and owner flows, including unauthorized access and draft/publish separation.

## 11. Explicitly Out of Scope for V1

- Appointment booking/calendar and automated reminders
- Online payments/subscriptions
- WhatsApp automation or AI receptionist
- Multiple salons, tenant isolation, and platform-wide SaaS billing
- Staff accounts and detailed role-based access
- Inventory, payroll, and advanced CRM
- Arbitrary drag-and-drop layout editing or user-written code/HTML
- Full ticketing system or live developer chat
- Advanced marketing attribution or enterprise analytics
- AI-powered chatbot requiring model/API usage

## 12. Acceptance Criteria

V1 is release-ready only when:

### Public site
- Home, Services, About, Gallery, Contact, Login, and the agreed Signup flow load and navigate correctly.
- Public visitors see published content only.
- All approved contact links work and no fake business details remain.
- Mobile, tablet, and desktop layouts have been checked; no obvious overflow or broken layout remains.
- Basic SEO and accessibility checks have been completed.

### Authentication and CMS
- Unauthenticated visitors cannot access protected dashboard pages or APIs.
- A new signup cannot automatically obtain owner privileges.
- Owner can edit supported fields, see the same page update in live preview, save a draft, and publish only after confirmation.
- Draft edits do not appear on the public website before publishing.
- Owner cannot change page structure or inject arbitrary HTML/scripts through the CMS.
- Image upload restrictions and error states work if uploads are enabled.

### Enquiries and analytics
- Test enquiry is stored and visible only to authorized owner access.
- Status changes work.
- Analytics dashboard displays the defined metrics and explains important counting limitations.
- Analytics events do not expose private enquiry details.

### Chatbot and support
- FAQ chatbot answers configured questions and safely handles unknown questions.
- Support form shows accurate success/error states and stores/delivers requests as agreed.

### Quality and release
- Production build succeeds.
- Relevant tests/checks actually run and results are recorded.
- Critical flows are tested manually in a browser.
- Known limitations, service dependencies, environment variables, and deployment steps are documented in `README.md`.

## 13. Suggested Implementation Order

1. Confirm architecture, auth, database, storage, analytics, and support submission decisions.
2. Build and verify the public site using representative placeholder content.
3. Add authentication and protect owner routes.
4. Add structured CMS editing, live preview, draft, and publish.
5. Add enquiry storage and owner enquiry list.
6. Add basic analytics.
7. Add rule-based FAQ chatbot.
8. Add developer support request flow.
9. Complete security, responsive, accessibility, and release testing.

## 14. Beginner-Friendly Delivery Rule

Do not ask the coding agent to build every feature in one prompt. Work one milestone at a time. For each milestone, review the plan, implement, run checks, inspect the browser, and only then mark tasks verified.

## 15. Decisions Required Before Coding

- **Technology stack:** choose a framework and backend approach.
- **Authentication/onboarding:** who creates or approves the single owner account? Is signup a real public signup or an invitation-only flow?
- **Database/auth provider:** choose a service that fits the required security and budget.
- **Image storage:** choose persistent storage compatible with deployment.
- **Analytics:** choose privacy-conscious first-party analytics or a managed provider and define what counts as a visit.
- **Enquiry delivery:** where are enquiries stored, and should email notification be sent?
- **Developer support:** where are support requests stored and how does the developer receive them?
- **Deployment/budget:** confirm hosting, domain, free-tier limits, and whether any paid services are acceptable.
- **Content:** provide real salon details, services/prices, images, policies, and social/contact links.

Do not silently choose services that require billing or promise features that the selected free tier cannot support.
