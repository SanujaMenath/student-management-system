<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Handahamy Educational Institute — Project Guide

> Note: `CLAUDE.md` imports `@AGENTS.md`. Keep this file as the single source of truth for repository conventions, schemas, AI pipelines, and UI design tokens.

---

## 1. Project Overview & Tech Stack

- **Project:** Handahamy Educational Institute — Student Management System, Public Website & Admissions Portal, Online Fee Payments, and Role-Based Admin / Staff / Parent Portals.
- **Tech Stack:**
  - **Framework:** Next.js `16.3.4` App Router, React `19.2.8`, TypeScript `5` (`strict: true` in `tsconfig.json`).
  - **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`, `@import "tailwindcss"` in `src/app/globals.css`) with Geist (`--font-geist-sans` / `font-sans`) and `lucide-react` icons.
  - **Backend & Database:** Supabase (PostgreSQL, Auth via `@supabase/ssr` & `@supabase/supabase-js`, Row Level Security, `pgvector`, and private Storage buckets).
  - **AI / RAG:** Google Gemini (`@google/genai`).
  - **Payments & Validation:** Stripe (`stripe`, `@stripe/stripe-js`) and Zod (`zod`).
- **Directory & Code Conventions:**
  - Modular separation across `src/app/` (routes, layouts, API route handlers), `src/actions/` (Server Actions), `src/lib/` (Supabase clients, storage helpers, Stripe, validations), `src/components/` (reusable UI & modals), `src/config/` (navigation config), and `src/types/` (shared TypeScript types).
  - Route protection and role boundaries (`/admin/*`, `/staff/*`, `/parent/*`, `/api/protected/*`) are enforced in `src/middleware.ts` via Supabase Auth + `profiles.role`.
  - Strict TypeScript typing (`strict: true`); avoid `any` and validate external inputs with Zod or explicit type guards.
  - Zero ungrounded hallucinations in AI features: responses must rely strictly on retrieved `nursery_knowledge` chunks and live `events` rows.

---

## 2. Database Schema & Row Level Security (Supabase)

Migrations live in `supabase/migrations/` (`001` through `012`).

### Core Tables

- `public.profiles`: Linked to `auth.users(id)` (`ON DELETE CASCADE`) via `handle_new_user()` trigger; stores `role` (`public.user_role` enum: `'admin' | 'staff' | 'parent'`), `full_name`, `email`, `phone`, `avatar_url`.
- `public.staff`: Staff directory (`id` TEXT PK e.g. `STF-018`, `full_name`, `role`, `assigned_class`, `contact`, `status` `staff_status`), linked to `profiles(id)` via `profile_id` UUID (added in `010_staff_learning_management.sql` with partial unique index `idx_staff_profile_id`).
- `public.classes`: Classrooms (`id` BIGSERIAL PK, `name`, `room_number`, `capacity`, `age_group`, `schedule`, `teacher_id` TEXT referencing `public.staff(id)`).
- `public.students`: Enrolled students (`id` UUID PK, `admission_number` UNIQUE, `first_name`, `last_name`, `date_of_birth`, `gender`, `blood_group`, `allergies`, `emergency_contact`, `class_id` BIGINT referencing `public.classes(id)`, `parent_id` UUID referencing `public.profiles(id)`, `status`).
- `public.events`: Institute events (`id` TEXT PK e.g. `EVT-032`, `title`, `event_date`, `event_time`, `location`, `status` `public.event_status` enum: `'Parents notified' | 'Scheduled' | 'Draft' | 'Planning'`, `description`).
- `public.nursery_knowledge`: RAG knowledge base (`id` BIGSERIAL PK, `category`, `title`, `content`, `embedding vector(768)`), queried via `match_nursery_knowledge(query_embedding, match_threshold, match_count)`.
- `public.student_progress`: Developmental tracking (`id` UUID PK, `student_id` -> `students(id)`, `staff_id` -> `profiles(id)`, `learning_area`, `progress_level`, `teacher_note`, `recorded_at`).
- **Additional Module Tables:** `admissions`, `fee_payments`, `fee_invoices`, `announcements`, `learning_materials` (with private bucket `learning-materials`), `career_applications` (with private bucket `career-cvs`), `incident_reports` (with private bucket `incident-attachments`), and `notifications`.

### Row Level Security (RLS) Rules

- **`admin`:** Full access (`FOR ALL`) across portal tables when `profiles.role = 'admin'`.
- **`staff`:** Scoped strictly to assigned classes via `classes.teacher_id -> staff.id` where `staff.profile_id = auth.uid()` for viewing `students`, viewing/inserting `student_progress`, and managing class `learning_materials`.
- **`parent`:** Scoped strictly to own children (`students.parent_id = auth.uid()`) for viewing `students`, `student_progress`, `fee_invoices`, and enrolled-class `learning_materials`.
- **Idempotent Migrations:** Always include `DROP POLICY IF EXISTS` before `CREATE POLICY` (and `IF NOT EXISTS` / `ON CONFLICT`) in SQL migrations so scripts can be re-run safely.

---

## 3. Unified Portal UI & Figma Design System (Admin, Staff & Parent Portals)

Shared shell implemented across `src/app/admin/layout.tsx`, `src/app/staff/layout.tsx`, and `src/app/parent/layout.tsx`.

- **Typography:** Single unified `font-sans` (Geist via `--font-geist-sans`) across all portals; never mix font families.
- **Color Tokens:**
  - Sidebar background: `#082F27` (Dark Green)
  - Primary / Active accent: `#187055` (Hover: `#145C46`)
  - Page canvas & subtle inputs/badges: `#F5F8F7` (hover `#E8F0EC`)
  - Borders & dividers: Card border `#D8E4DF`, Secondary button border `#B8D3C8`, Header divider `#E5E7EB`
  - Text hierarchy: Headings `#082F27` / `#111827`, Body `#374151`, Muted `#6B7280` (placeholders `#9CA3AF`), Alert badge `#EF4444`
- **Shared Portal Shell:**
  - Sticky full-height sidebar: `sticky top-0 h-screen w-72 shrink-0 bg-[#082F27] p-5` wrapping `flex flex-col justify-between h-full`.
  - Branding block: `HANDAHAMY` (`text-[20px] font-bold uppercase`) + `EDUCATIONAL INSTITUTE` (`text-[11px] font-semibold uppercase`), with `pb-7 border-b border-white/15` divider.
  - Portal role label: `ADMIN PORTAL` / `STAFF PORTAL` / `PARENT PORTAL` in `text-[12px] tracking-widest uppercase text-[rgba(167,243,208,0.6)]`.
  - Scrollable navigation container (`flex-1 min-h-0 overflow-y-auto`) with `<nav className="space-y-2 pb-2">` and `rounded-[12px]` items (`bg-[#187055] text-white font-semibold` when active).
  - Anchored bottom footer (`pt-4 border-t border-white/15`) containing `Logout` action and user profile capsule.
- **Header & Content:**
  - Top header: `min-h-[96px] bg-white px-6 lg:px-10 border-b border-[#E5E7EB]` with `max-w-[512px]` `#F5F8F7` search bar, notification bell with `#EF4444` badge, and user avatar.
  - Main content area: `flex-1 bg-[#F5F8F7] py-10 px-6 lg:px-10` with inner `max-w-[1280px] mx-auto w-full` container.

---

## 4. Development & Git Guidelines

- Do not modify unrelated backend logic, Server Actions, or RLS policies when applying UI changes.
- Always configure `Next.js <Image fill>` components with explicit `sizes` props (e.g., `sizes="(max-width: 1024px) 100vw, 420px"`) to prevent browser performance warnings.
- Preserve the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file so `next dev` does not regenerate noisy uncommitted diffs.
