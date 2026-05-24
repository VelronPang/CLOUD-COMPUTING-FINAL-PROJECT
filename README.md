# Jenny's Mod 🎮

A community-driven mod hosting platform — like Modrinth or CurseForge — built with React + Supabase.

## Features

- 🔐 **Auth** — Sign up / sign in with email (Supabase Auth)
- 📦 **Upload Mods** — Upload mod files (`.zip`, `.jar`, `.pak`) and cover images to Supabase Storage
- 🌍 **Public Browse** — Anyone can browse, search, and filter mods without an account
- ✏️ **Full CRUD** — Create, read, update, delete your own mods from the dashboard
- 📊 **Download Tracking** — Every download is logged; count shown on each mod
- ⚡ **Serverless** — Supabase Edge Functions handle CRUD + download tracking (Deno runtime)
- 🛡️ **Row Level Security** — PostgreSQL RLS ensures users can only edit their own data

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (deployed on Vercel) |
| Backend | Supabase Edge Functions (serverless Deno) |
| Database | Supabase PostgreSQL (managed) |
| Storage | Supabase Storage (S3-compatible CDN) |
| Auth | Supabase Auth (JWT + RLS) |
| CDN | Vercel Edge Network + Supabase CDN |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/jennysmod.git
cd jennysmod
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, choose a name and password
3. Wait ~2 minutes for the project to spin up

### 3. Set up the database

1. In Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the contents of `supabase/migrations/001_initial.sql`
3. Click **Run**

### 4. Create storage bucket

1. In Supabase dashboard → **Storage** → **New Bucket**
2. Name it `mod-assets`, check **Public bucket** → Create
3. Go to **Policies** on that bucket and add:
   - SELECT: `true` (public reads)
   - INSERT: `auth.role() = 'authenticated'`
   - DELETE: `auth.uid()::text = (storage.foldername(name))[2]`

### 5. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase keys (from **Settings → API** in your project):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

Add your environment variables in Vercel dashboard → Project Settings → Environment Variables.

## Project Structure

```
jennysmod/
├── src/
│   ├── components/         # Navbar, ModCard
│   ├── context/            # AuthContext (Supabase auth state)
│   ├── lib/                # Supabase client
│   └── pages/              # Home, Browse, ModDetail, Upload, EditMod, Dashboard, Login, Register
├── supabase/
│   ├── functions/
│   │   ├── mods/           # Edge Function: CRUD operations (serverless)
│   │   └── download-track/ # Edge Function: tracks downloads + logs
│   └── migrations/
│       └── 001_initial.sql # Full DB schema with RLS + triggers
├── .env.example
└── README.md
```

## Observability

- **Logs**: Supabase Dashboard → Edge Functions → Logs (real-time function logs)
- **DB Metrics**: Supabase Dashboard → Reports → Query performance, table sizes
- **Download Analytics**: Query `download_logs` table for time-series data
- **Vercel Analytics**: Enable in Vercel project for web vitals + traffic

## Cost Controls

This project runs entirely on free tiers:
- **Supabase Free**: 500MB DB, 1GB Storage, 2M Edge Function invocations/month
- **Vercel Free**: 100GB bandwidth, unlimited deployments

To set up alerts: Supabase Dashboard → Settings → Billing → Usage alerts
