# Design System — Salon Website

**Status:** Shared design rules for all releases; confirm brand details with the owner.  
**Purpose:** Define a consistent public website and a usable owner editing experience without creating a complex page builder.

## 1. Design Goals

- Public website: premium, welcoming, trustworthy, and easy to navigate.
- Owner dashboard: calm, clear, task-oriented, and beginner-friendly for a salon owner who is not technical.
- Strong content hierarchy and prominent contact actions.
- Mobile-first responsive behaviour.
- Elegant visuals without sacrificing readability, accessibility, or speed.

## 2. Brand Inputs

- Salon name: `TODO`
- Logo: `TODO`
- Preferred style/reference websites: `TODO`
- Preferred language(s): `TODO`
- Brand colours, if already established: `TODO`

Do not invent a final brand identity if the owner has not supplied one. Propose a coherent draft and show the Home page for approval before applying it to every public page.

## 3. Public Website Visual Direction

Use a restrained, cohesive palette and no more than two font families. Choose readable typography, generous spacing, strong headings, and high-quality imagery. Avoid excessive gradients, animations, glassmorphism, decorative effects, and generic template-like sections.

Exact colours and fonts may be proposed by the coding assistant, but document the chosen values here before building all pages.

## 4. Public Layout and Components

- **Header:** Logo/name, simple navigation, one primary contact CTA; mobile menu must be keyboard accessible.
- **Hero:** Clear headline, short supporting copy, primary CTA, and a relevant image where available.
- **Service cards:** Consistent names, descriptions, prices, durations, and policy details where configured.
- **Gallery:** Consistent image treatment, responsive grid, and no stretched images.
- **Contact section:** Easy-to-find contact methods and business hours/address when provided.
- **Footer:** Useful navigation and verified contact/social links.
- **Buttons/forms:** Consistent size, states, focus indicator, and clear labels.
- **FAQ chatbot:** Small floating launcher that does not obscure content or key mobile controls.

## 5. Owner Dashboard and CMS Design

### 5.1 Navigation
Use a clear dashboard navigation with:
- Overview
- Edit Website
- Services
- Enquiries
- Analytics
- Developer Support
- Account / Sign out

Only include sections that are actually implemented.

### 5.2 Page editing workspace
On desktop, use a two-panel layout:
- **Left panel:** Structured editable fields for the selected page or section.
- **Right panel:** Live preview of that same page reflecting current unsaved changes.

The preview must be clearly labelled as a draft/preview. Provide clear actions for `Save Draft`, `Preview`, and `Publish Changes`. Publishing should require a deliberate confirmation.

On mobile and narrow tablets, stack the panels or offer accessible tabs such as `Edit` and `Preview`; do not force a cramped side-by-side layout.

### 5.3 Editing controls
Use appropriate controls:
- Text inputs for short fields.
- Textareas or a simple safe rich-text option for longer content.
- Validated URL fields for social/contact links.
- Image upload, preview, replace, and remove controls for media.
- Repeating structured fields for services, categories, opening hours, and policies where required.

Do not allow arbitrary HTML, scripts, custom CSS, or free-form layout editing. Show validation errors next to the relevant fields. Warn users about unsaved changes.

### 5.4 Content states
Make the difference between draft and published content obvious. Show save/publish status and useful success/error messages. A failed save must not silently discard user edits.

### 5.5 Analytics and enquiry screens
- Use plain-language metric labels and concise charts/cards.
- Include useful empty states and date ranges.
- Keep visitor analytics separate from identifiable enquiries.
- Use clear enquiry status labels and readable tables/cards.
- Avoid showing sensitive customer details in charts or logs.

## 6. Responsive Behaviour

- Start with mobile layout, then enhance for tablet and desktop.
- Navigation must remain usable on narrow screens.
- Public grids should collapse naturally without tiny cards.
- Dashboard editing panels should stack or switch views on narrow screens.
- Text must remain readable; avoid fixed widths that cause overflow.
- Images must preserve aspect ratio and crop intentionally.
- Test at approximately 360px, 768px, 1024px, and 1440px viewport widths.

## 7. Motion

Use subtle, purposeful transitions only. Respect `prefers-reduced-motion`. Do not add animation that delays access to content or makes navigation harder.

## 8. Accessibility

- Use semantic HTML landmarks and a logical heading order.
- Ensure keyboard access and visible focus states.
- Use meaningful alt text for informative images and empty alt text for decorative images.
- Provide adequate colour contrast and clear form labels.
- Do not communicate meaning through colour alone.
- Dialogs, mobile menus, dashboard tabs, and chatbot controls must be keyboard accessible and have accessible names.

## 9. Images and Assets

- Prefer owner-supplied images or images with clearly permitted usage.
- Do not hotlink random images or use copyrighted images without permission.
- Optimize file sizes and use appropriate formats.
- Store public, non-secret assets under `public/`.
- Never put passwords, API keys, or private customer data in `public/`.
- Owner uploads intended for public display must use an approved persistent storage solution, not an unverified temporary production filesystem.

## 10. Design Approval Workflow

1. Propose the visual direction and implement only the Home page first.
2. Review the result in desktop and mobile browser sizes.
3. Record approved colours, typography, spacing, and component patterns here.
4. Build the remaining public pages using the approved system.
5. Design the dashboard shell and one page-editing flow before implementing every CMS section.
6. Update this document only when an intentional design decision changes.

## 11. V2 Appointment Booking UX & Design Rules

- **Mobile-First Experience:** The customer booking flow (`/book`) must be easily usable one-handed on small screens (320px–375px) without horizontal scrolling or tiny hit targets.
- **Clear Stepped Flow:** Guide the customer smoothly: Service → Staff ("Any" or specific) → Date → Slot → Contact Details → Review → Confirmation.
- **Transparent Summary:** Always display duration, total price, and cancellation cutoff before final submission. Never surprise the client.
- **Non-Color Dependent States:** Do not use color alone to communicate slot availability or status. Use text labels, disabled attributes, and aria tags.
- **First-Class UI States:**
  - *Loading:* Skeleton loaders for date/time slots.
  - *Empty:* Encouraging empty states when no slots are open on a selected date.
  - *Slot Taken Conflict (`SLOT_UNAVAILABLE`):* Clear alert explaining another client just booked that slot, with immediate 1-click slot refresh.
  - *Network Retry:* Preserves user inputs and idempotency key on failure.
- **Dashboard Calendar UX (`/dashboard/appointments`):**
  - Clean day and week views with status badges (`confirmed`, `arrived`, `in_service`, `completed`, `cancelled`, `no_show`).
  - Search by client name, phone, or booking reference.
  - Reschedule modal displaying old vs new slot with atomic confirmation.
- **Accessibility & Focus:**
  - Fully navigable via keyboard (Tab and Arrow keys for date/time chips).
  - Screen reader announcements for slot selection and errors (`role="alert"`).
  - High-contrast focus rings matching existing design tokens.
  - List alternative alongside visual calendar grids.
