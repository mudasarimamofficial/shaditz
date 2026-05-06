Shaditz MVP: landing page + lead capture + admin dashboard.

## Getting Started

### 1) Database (Supabase)
- Create a dedicated Supabase project for Shaditz.
- Run all SQL files in `supabase/migrations` in order in the Supabase SQL Editor.
- In Supabase Auth, create an admin user (email + password). Only authenticated users can access `/admin`.

### 2) Environment Variables
Copy `.env.example` to `.env.local` and fill in values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` (default `assets`)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (must be verified in Resend)
- `ADMIN_NOTIFICATION_EMAIL` (fallback if `settings.admin_email` is missing)

### 3) Run locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4) Admin dashboard
- Visit `http://localhost:3000/admin`
- Sign in using the Supabase Auth admin email + password
- Use Builder, Pages, Leads, Media, JSON and Settings panels

### 5) How lead submission works
- Landing form submits to `POST /api/leads`.
- The server inserts the lead into Supabase using `SUPABASE_SERVICE_ROLE_KEY`.
- The server reads `settings.admin_email` and sends a “New Lead Alert” email using Resend.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel
- Create a new Vercel project for Shaditz (do not reuse CoachFlow Vercel project).
- Set the same environment variables in Shaditz Vercel Project Settings.
- Deploy and verify `/api/health` reports the Shaditz commit SHA.
