# MotoManipal

Engineering operations platform for the MotoManipal racing team. Track tasks, manage projects, coordinate subsystems, and monitor team performance — all from a single dark-themed telemetry dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Private-red)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [API Routes](#api-routes)
- [Security](#security)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Development Conventions](#development-conventions)
- [License](#license)

---

## Overview

MotoManipal is a full-stack engineering management platform built for a university racing team. It provides role-based access to dashboards, project tracking, task management, team administration, and subsystem coordination. The application is server-rendered with Next.js 16 App Router, uses Supabase for authentication and PostgreSQL for data, and enforces Row-Level Security (RLS) at the database level.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| UI | React 19.2.4, Tailwind CSS v4 |
| Components | shadcn/ui, Radix UI primitives |
| Icons | lucide-react |
| Forms | react-hook-form, Zod v4 |
| Charts | recharts |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (SSR cookie-based) |
| Validation | Zod v4 |
| Language | TypeScript 5 (strict mode) |

---

## Features

- **Dashboard** — Real-time metrics, upcoming deadlines, recent activity feed, subsystem progress
- **Projects** — Create, archive, and track projects with milestone-based progress
- **Tasks** — Full task lifecycle (To Do → In Progress → In Review → Approved/Blocked), multi-assignee support, task updates, comments, and attachments
- **Team Management** — View team members by subsystem, roles, and activity status
- **Admin Panel** — User management, bulk user import, role assignment, subsystem management, invitation system, audit logs, analytics
- **Role-Based Access Control** — Five roles: `ADMIN`, `TEAM_MANAGER`, `CAPTAIN`, `SUBSYSTEM_LEAD`, `MEMBER`
- **Subsystem Tracking** — Seven engineering subsystems: Structures, Transmission, Vehicle Dynamics, Aerodynamics, EPT (Electrical, Powertrain & Telemetry), Machine Learning, Management
- **Notifications** — In-app notification feed
- **Activity Logs** — Audit trail of team actions
- **File Attachments** — Per-user private storage for task attachments

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm, yarn, pnpm, or bun
- A Supabase project with the migrations applied

### Installation

```bash
# Clone the repository
git clone https://github.com/AyushB7/motomanipal.git
cd motomanipal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in the values in .env.local (see Environment Variables below)

# Apply database migrations
# Run the SQL files in supabase/migrations/ in order via the Supabase SQL editor:
#   1. 20260628_task_assignments_and_subsystem_standardization.sql
#   2. 20260629_subsystem_restandardization.sql
#   3. 20260630_security_rls_all_tables.sql

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create a `.env.local` file at the project root with the following variables:

```env
# Required — Supabase public credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required — Supabase service role key (server-only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

| Variable | Required | Exposed to Client | Purpose |
|----------|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anonymous key (used with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **No** | Service role key (bypasses RLS, server-only) |

> **Warning:** `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser. It is only imported in server-side `.ts` files under `src/lib/` and `src/actions/`.

---

## Project Structure

```
motomanipal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/                # Authenticated route group
│   │   │   ├── layout.tsx        # App shell with Sidebar + auth guard
│   │   │   ├── dashboard/        # Dashboard page + loading state
│   │   │   ├── projects/         # Projects list + detail pages
│   │   │   ├── tasks/            # Tasks list + detail pages
│   │   │   ├── team/             # Team members page
│   │   │   ├── settings/         # User settings page
│   │   │   └── admin/            # Admin panel (ADMIN only)
│   │   ├── (auth)/               # Public auth routes
│   │   │   ├── login/            # Login page
│   │   │   └── layout.tsx        # Auth layout (no sidebar)
│   │   ├── api/                  # API routes
│   │   │   └── auth/profile/     # Client-side profile fetch endpoint
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── globals.css           # Global styles + design tokens
│   │   └── page.tsx              # Root redirect
│   ├── components/
│   │   ├── ui/                   # Reusable UI components (shadcn-style)
│   │   ├── admin/                # Admin panel components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── projects/             # Project components
│   │   ├── tasks/                # Task components
│   │   └── layout/               # Layout components (Sidebar, etc.)
│   ├── lib/
│   │   ├── actions/              # Server actions (dashboard, subsystems)
│   │   ├── auth/                 # Auth utilities (requireAuth, getProfile)
│   │   ├── supabase/             # Supabase client factories
│   │   │   ├── server.ts         # SSR client (cookie-based, respects RLS)
│   │   │   ├── admin.ts          # Service role client (bypasses RLS)
│   │   │   └── server-mutation.ts # Mutation helper (wraps adminClient)
│   │   ├── projects/             # Project data access
│   │   ├── tasks/                # Task data access
│   │   ├── subsystems/           # Subsystem data access
│   │   ├── team/                 # Team data access
│   │   ├── admin/                # Admin data access
│   │   ├── constants/            # Navigation, roles, static config
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   ├── actions/                  # Server actions (tasks, auth, admin, projects)
│   ├── middleware.ts             # Auth guard + rate limiter
│   └── types/                    # Shared TypeScript types
├── supabase/
│   └── migrations/               # Database migrations (run in order)
├── public/                       # Static assets (images, fonts)
├── next.config.ts                # Next.js config + security headers
├── tsconfig.json                 # TypeScript config + path aliases
└── package.json
```

---

## Database Schema

The application uses PostgreSQL with Row-Level Security enabled on all tables.

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to `auth.users`; stores role, subsystem, contact info |
| `subsystems` | Engineering subsystem definitions (7 canonical subsystems) |
| `projects` | Racing projects with status tracking |
| `milestones` | Project milestones |
| `tasks` | Tasks with status, deadlines, assignees, and subsystem linkage |
| `task_assignments` | Many-to-many junction table for task assignees |
| `task_updates` | Progress updates, comments, and status changes on tasks |
| `attachments` | File metadata linked to task updates |
| `notifications` | User notification feed |
| `activity_logs` | Audit trail of team actions |
| `invitations` | Pending team invitations (admin-managed) |

### Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `ADMIN` | Full access — user management, role assignment, audit logs, all tasks/projects |
| `TEAM_MANAGER` | Board-level access — view all tasks, manage assigned scope |
| `CAPTAIN` | Board-level access — view all tasks, manage assigned scope |
| `SUBSYSTEM_LEAD` | Board-level access — view all tasks, manage subsystem tasks |
| `MEMBER` | Limited access — view own profile, assigned tasks only |

### RLS Policies

All tables have explicit RLS policies. Key examples:

- **profiles** — `profiles_select_own_or_board`: users see their own profile; board+ roles see all profiles
- **tasks** — All authenticated users can read; updates restricted by role (MEMBER can only update own tasks)
- **activity_logs** — Board+ only for reads
- **attachments** — Private per-user folders in storage; users can only access their own files

---

## Authentication & Authorization

### Auth Flow

1. User submits credentials on `/login`
2. Middleware rate-limits failed attempts (10 per 15 minutes per IP)
3. Supabase Auth validates credentials and sets an HTTP-only session cookie
4. On subsequent requests, `createClient()` reads the cookie to authenticate
5. `requireAuth()` in the `(app)` layout guards all authenticated routes
6. Unauthenticated users are redirected to `/login`

### Client-Side Auth

The Sidebar fetches the user's profile client-side via `/api/auth/profile` after hydration. This avoids a server-side profile fetch on every navigation, reducing time-to-interactive.

### Server vs Admin Client

| Client | Location | RLS | Use Case |
|--------|----------|-----|----------|
| `createClient()` | Server components, API routes | Respected | Auth checks, RLS-restricted reads (profiles, activity_logs, notifications) |
| `adminClient` | Server actions, data access | Bypassed | Fast reads on RLS-open tables (tasks, projects, subsystems); mutations with explicit permission checks |

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/auth/profile` | Required | Returns the authenticated user's profile (full name, role, subsystem) |
| `POST` | `/api/tasks/create-update` | Required | Creates a task update (progress, comment, status change, approval, rejection) |

---

## Security

### HTTP Headers

The following security headers are applied globally via `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` — restricts scripts, styles, images, fonts, and connections to trusted sources

### Rate Limiting

Login endpoint is rate-limited to 10 failed attempts per IP per 15-minute window. Exceeding the limit returns HTTP 429 with a `Retry-After` header.

### Data Protection

- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is never exposed to the client
- All database access goes through RLS-respecting clients unless explicitly bypassed with server-side permission checks
- File attachments are stored in private, per-user storage buckets
- Session cookies are HTTP-only and transmitted securely

---

## Design System

MotoManipal uses a dark "racing telemetry" theme built on Tailwind CSS v4 with CSS custom properties.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#050507` | Page background |
| `--card` | `#0a0a0d` | Card surfaces |
| `--foreground` | `#d0d0d8` | Body text |
| `--primary` | `#e8241a` | Velocity red — accents, CTAs, active states |
| `--muted-foreground` | `#8a8a98` | Secondary text, labels |
| `--border` | `#222228` | Borders, dividers |

### Subsystem Colors

Each engineering subsystem has a distinct telemetry channel color:

| Subsystem | Background | Foreground |
|-----------|-----------|------------|
| Structures | `#0d1a2a` | `#60a5fa` |
| Transmission | `#1e0f04` | `#f97316` |
| Electronics / EPT | `#0d1a08` | `#84cc16` |
| Machine Learning | `#170d28` | `#a78bfa` |
| Aerodynamics | `#041414` | `#2dd4bf` |
| Management | `#1a0d04` | `#fb923c` |

### Typography

- **Sans:** Geist Sans (body text)
- **Mono:** Geist Mono (code, metrics, tabular numbers)
- **Base size:** 13px with optimized legibility settings (`tnum`, `cv02`–`cv11` font features)

### Component Library

UI components are built with shadcn/ui patterns using:
- `class-variance-authority` for variant styling
- `clsx` + `tailwind-merge` via the `cn()` utility
- Radix UI primitives for accessible interactive components (Dialog, Dropdown, Select, Tabs)

---

## Deployment

### Vercel (Recommended)

1. Connect the repository to Vercel
2. Set the three environment variables in the Vercel dashboard
3. Deploy — Vercel automatically detects Next.js and configures the build

### Self-Hosted

```bash
npm run build
npm run start
```

The production server runs on port 3000 by default. Configure a reverse proxy (nginx, Caddy) for TLS termination.

### Post-Deployment

After deploying, ensure the Supabase project has:
- Email auth enabled (or your chosen auth provider)
- All three migrations applied
- RLS enabled on all tables
- The `attachments` storage bucket created with private access

---

## Development Conventions

### Path Aliases

Use the `@/` alias for all imports from `src/`:

```ts
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
```

### Server Components vs Client Components

- **Default:** All components are Server Components unless marked with `"use client"`
- **Client Components:** Required for hooks (`useState`, `useEffect`), event handlers, and browser APIs
- **Server Actions:** Use `"use server"` directive for database mutations called from client components

### Data Fetching

- Server components fetch data directly (no API layer needed)
- Use `Promise.all()` for parallel queries in the same component
- Use `createClient()` for RLS-respecting queries; `adminClient` only for tables where RLS allows all authenticated reads

### Naming

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Components: `PascalCase` exports
- Types: `PascalCase` with descriptive suffixes (`ProfileWithSubsystem`, `DashboardTask`)
- Database: `snake_case` tables and columns

### Linting

```bash
npm run lint
```

ESLint is configured with `eslint-config-next`.

---

## License

Private — MotoManipal Racing Team. All rights reserved.
