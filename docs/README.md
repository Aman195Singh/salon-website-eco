# Project Documentation Directory

Welcome to the documentation folder for **Salon Website (Eco / Glow & Elegance)**.

This folder organizes guides and historical reference documents, keeping the project root uncluttered while preserving complete historical records.

---

## 📁 Documentation Map

```text
salon-website-eco/
├── 📄 README.md                        <- Project overview, quickstart & scripts
├── 📄 AGENTS.md                        <- Working rules and safety guidelines for AI agents
├── 📄 PRD-V2.md                        <- Active V2 Appointment Booking requirements (Source of Truth)
├── 📄 TASKS.md                         <- Active task tracker (Phase 8 Booking MVP)
├── 📄 CURRENT_STATE.md                 <- Verified vs reported feature state
├── 📄 DESIGN.md                        <- Design tokens, typography, component guidelines & UX rules
├── 📄 PRODUCT_VISION.md                <- Long-term product direction
├── 📄 VERSION_ROADMAP.md               <- Release boundaries (V1 -> V1.5 -> V2 -> Future)
│
└── 📁 docs/
    ├── 📄 README.md                    <- This documentation directory guide
    │
    ├── 📁 guides/                      <- Developer and onboarding guides
    │   ├── START_HERE_HINDI.md         <- Beginner guide in simple Hindi
    │   └── VISUAL_ASSETS_AND_AI_PROMPTS.md <- Image generation prompts and visual reference notes
    │
    └── 📁 archive/                     <- Historical specifications and release logs
        ├── PRD-V1.md                   <- Historical requirements for V1 Public Website
        ├── PRD-V1.5.md                 <- Historical requirements for V1.5 Hardening & CMS
        ├── PRE_V1.5_FIXES.md           <- Bugfix history prior to V1.5
        ├── V1.5_PROGRESS.md            <- Detailed implementation timeline for V1.5
        └── V1.5_RELEASE_REPORT.md      <- Full verification report for V1.5 release
```

---

## 📌 Document Guide

### 1. Active Working Documents (Located in Root)
- **[AGENTS.md](../AGENTS.md):** Mandatory rules for AI agents. Specifies read orders, strict compatibility rules, zero client trust, and double-booking prevention guardrails.
- **[PRD-V2.md](../PRD-V2.md):** The single source of truth for V2 Appointment Booking MVP. Covers booking flows, data models, slot calculation, concurrency prevention, and edge cases.
- **[TASKS.md](../TASKS.md):** Phase-by-phase task checklist. Tracks progress from Phase 8.0 through 8.6.
- **[CURRENT_STATE.md](../CURRENT_STATE.md):** Live status of verified features.
- **[DESIGN.md](../DESIGN.md):** Palette, spacing, typography, mobile layout rules, and booking UI states.
- **[PRODUCT_VISION.md](../PRODUCT_VISION.md):** Vision for the salon web platform.
- **[VERSION_ROADMAP.md](../VERSION_ROADMAP.md):** Phased milestone breakdown across releases.

### 2. Guides & Reference ([docs/guides/](./guides/))
- **[START_HERE_HINDI.md](./guides/START_HERE_HINDI.md):** Beginner-friendly project setup, explanation of core files, and development workflow in simple Hindi.
- **[VISUAL_ASSETS_AND_AI_PROMPTS.md](./guides/VISUAL_ASSETS_AND_AI_PROMPTS.md):** AI image prompts used for placeholder salon photography and design inspiration.

### 3. Historical Archive ([docs/archive/](./archive/))
*Note: These files are immutable records of earlier project milestones. They should not be modified.*
- **[PRD-V1.md](./archive/PRD-V1.md):** V1 original public site specification.
- **[PRD-V1.5.md](./archive/PRD-V1.5.md):** V1.5 CMS, enquiries, analytics, and hardening specification.
- **[PRE_V1.5_FIXES.md](./archive/PRE_V1.5_FIXES.md):** Record of fixes FIX-00 through FIX-09.
- **[V1.5_PROGRESS.md](./archive/V1.5_PROGRESS.md):** Daily log of V1.5 development.
- **[V1.5_RELEASE_REPORT.md](./archive/V1.5_RELEASE_REPORT.md):** Final release sign-off and regression verification for V1.5.
