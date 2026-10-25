# 🌟 Luxury Salon Website & Management Web App

A modern, high-conversion luxury salon website and single-salon owner management system built with **Next.js (App Router)** and **Supabase**.

---

## 🎯 Current Target: V2 — Appointment Booking Management (V1.5 Released)

- **V1.5 Quality Release:** Fully verified and released on 2026-10-24 (Tagged `v1.5`). Features include dynamic CMS rendering, mobile polish, email reply composer, CMS safety guards, security/RLS hardening, sitemap/robots, and legal pages. See `docs/archive/V1.5_RELEASE_REPORT.md` and `docs/archive/V1.5_PROGRESS.md`.
- **V2 Milestone (Active):** Phase 1 — Appointment Booking Management MVP (`PRD-V2.md`). In-person appointments, staff scheduling, availability engine, double-booking prevention, mobile booking journey (`/book`), and owner calendar.

---

## ✨ Features

### 🏛️ Public Experience
- **Cinematic Luxury Design:** Warm editorial palette, smooth micro-interactions, responsive mobile-first navigation.
- **Dynamic Content & CMS Fallback:** Real-time sync with Supabase with resilient static fallback data.
- **Interactive Service Menu:** Filterable by category (Hair, Skin & Facial, Bridal, Grooming, Nails) with pricing and duration.
- **Visual Showcase Gallery:** Interactive image showcase and categories.
- **Contact & Enquiry Form:** Direct enquiry submission with validation and Supabase persistence.
- **Smart Floating FAQ Chatbot:** Instant answers to popular salon questions (hours, pricing, parking, bridal packages, booking) with smooth WhatsApp & call fallbacks.
- **Customer Account Management:** User registration, login, profile name update, password change, and enquiry history.

### 👑 Salon Owner Management Suite
- **Owner-Exclusive Dashboard:** Protected by server & database-level Row Level Security (RLS).
- **Live Split-Screen CMS Editor:** Desktop two-panel layout with live website preview, mobile responsive tabs, draft saving, and instant 1-click publishing.
- **Service Management:** Add, edit, reorder, price, toggle active/inactive status.
- **Enquiries Hub:** View client submissions with instant WhatsApp and Phone call action links.
- **Privacy-First Analytics:** Track pageviews, button clicks, and enquiries without cookies or invasive third-party trackers.
- **Support System:** Direct communication channel for system feedback.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** CSS Modules with Design System tokens (`DESIGN.md`)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Icons:** Modern SVG icons with accessible labeling

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
- A free [Supabase](https://supabase.com/) project

### 2. Installation

Clone this repository and install the dependencies:
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd salon-website-eco
npm install
```

### 3. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup

1. Open your Supabase Project Dashboard -> **SQL Editor**.
2. Run the SQL script found in `supabase-schema.sql`.
3. *(Optional)* If updating RLS policies, run `fix-rls.sql`.

### 5. Run the Local Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Checks

Run lint checks:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 📁 Project Structure & Documentation

```
├── docs/                   # Guides (Hindi onboarding, prompts) and archive (V1/V1.5 PRDs & logs)
├── public/                 # Static images, luxury photos & icons
├── scripts/                # Verification and QA automation scripts
├── src/
│   ├── app/                # Next.js App Router (Public routes & Dashboard)
│   │   ├── (auth)/         # Login, Register, Forgot Password
│   │   ├── account/        # Customer profile & enquiry history
│   │   ├── dashboard/      # Owner CMS, Services, Enquiries, Analytics
│   │   ├── services/       # Public service list
│   │   ├── gallery/        # Luxury showcase
│   │   ├── about/          # Salon story & philosophy
│   │   └── contact/        # Location, hours, enquiries
│   ├── components/         # Header, Footer, FAQChatbot, Live Preview
│   └── lib/                # Supabase client, Content helpers, Analytics
├── supabase-schema.sql     # Complete database schema and RLS policies
├── AGENTS.md               # Safety rules and AI implementation guardrails
├── PRD-V2.md               # Active Product Requirements Document (V2 Booking MVP)
├── TASKS.md                # Task list and implementation progress
├── DESIGN.md               # Design System and visual guidelines
└── README.md               # Project documentation
```

---

## 📄 License
Private project. All rights reserved.
