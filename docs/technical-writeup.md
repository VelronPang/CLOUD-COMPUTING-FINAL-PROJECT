# Jenny's Mod — Technical Write-Up

**Course:** Cloud Computing / Web Application Development
**Stack:** React + Supabase + Vercel
**Project Type:** Option 1 — Cloud-Backed Web Application

---

## 1. Overview

Jenny's Mod is a community mod-hosting platform inspired by Modrinth and CurseForge. It allows players and modders to upload, browse, and download game mods for popular games including Minecraft, Skyrim, Cyberpunk 2077, and others.

The project satisfies all Option 1 requirements:
- **CRUD** on a core entity (`mods` table) — authenticated users can create, read, update, and delete their mods
- **Public read-only listing page** served via CDN (Vercel Edge + Supabase CDN)
- **File uploads** to cloud object storage (Supabase Storage, S3-compatible)
- **HTTPS deployment** via Vercel (auto-provisioned SSL)
- **Serverless functions** via Supabase Edge Functions (Deno runtime)
- **Managed PostgreSQL database** via Supabase
- **Observability** via Supabase dashboard logs and Vercel Analytics
- **Cost controls** using Supabase's free tier usage alerts

---

## 2. Architecture

### Frontend — React SPA on Vercel CDN

The frontend is a single-page application built with **React 18** and **Vite**, deployed as a static site on **Vercel's global edge network**. There is no traditional web server; the HTML/CSS/JS bundle is served from CDN nodes worldwide, meaning users get sub-100ms page loads regardless of location.

Key libraries:
- `react-router-dom` — client-side routing
- `@supabase/supabase-js` — Supabase client SDK (handles auth, DB queries, storage)
- `lucide-react` — icon set
- `react-hot-toast` — toast notifications

### Backend — Supabase Edge Functions (Serverless)

Supabase Edge Functions run on the **Deno** runtime and are deployed globally at the edge. Two functions are implemented:

**`mods/`** — Handles public mod listing with filtering and search. Adds `Cache-Control: public, max-age=60` headers so responses are cached at the CDN layer.

**`download-track/`** — Called on every download. Uses a PostgreSQL RPC (`increment_download`) to atomically increment the download counter, then inserts a row into `download_logs` for observability. This is the serverless component satisfying the Lambda/Functions requirement.

The client-side Supabase SDK also directly queries the database for most operations (reads, writes, auth). This is standard Supabase architecture — the SDK communicates with the auto-generated PostgREST API, protected by Row Level Security.

### Database — Supabase PostgreSQL (Managed)

Three tables:

| Table | Purpose |
|---|---|
| `profiles` | User profiles, auto-created on signup via a trigger |
| `mods` | Core entity: name, description, category, game, version, file URLs, download count |
| `download_logs` | Every download event logged (mod_id, user_id, timestamp) |

**Row Level Security (RLS)** enforces that:
- Anyone can read mods and profiles (public)
- Only the owning user can insert/update/delete their own rows
- Download logs can be inserted by anyone (anonymous downloads supported)

An `updated_at` trigger auto-stamps mods on every edit. A `handle_new_user` trigger auto-creates a profile row when a new user signs up via Supabase Auth.

### Storage — Supabase Storage (S3-Compatible)

A single bucket `mod-assets` holds two types of objects:

- **`covers/{user_id}/{timestamp}.{ext}`** — cover images (PNG, JPG, WebP)
- **`mods/{user_id}/{timestamp}.{ext}`** — mod archive files (ZIP, JAR, PAK, 7Z)

The bucket is **public**, meaning file URLs are served directly via Supabase's CDN without requiring authentication. Storage RLS policies still restrict *who can upload and delete*, preventing unauthorised uploads.

### Authentication — Supabase Auth

Email/password authentication is handled entirely by Supabase. The client SDK manages JWT tokens in localStorage, refreshes them automatically, and exposes the current session via `onAuthStateChange`. A React context (`AuthContext`) wraps the whole app and provides the current user to all components.

---

## 3. How Each Requirement Is Met

### ✅ Authenticated CRUD
- **Create** — Upload page inserts a row into `mods` + uploads files to Supabase Storage
- **Read** — Browse page queries `mods` with filters; ModDetail page fetches a single mod
- **Update** — EditMod page pre-fills the form with existing data and patches the row
- **Delete** — Delete button on Dashboard and ModDetail with confirmation dialog

### ✅ Public Listing Page (CDN-cached)
The Browse page queries mods without authentication. The Edge Function serving `/mods` adds `Cache-Control: public, max-age=60`. Vercel's CDN caches the React bundle and assets globally. Supabase CDN caches public storage files.

### ✅ File Upload + Cloud Object Storage
Files are uploaded from the browser directly to Supabase Storage using the SDK. The resulting public URL is stored in the `mods` table and referenced on the detail page. No server-side upload handling needed.

### ✅ HTTPS Deployment
Vercel provisions a TLS certificate automatically on deployment. All traffic is forced to HTTPS with HSTS headers.

### ✅ Serverless Component
`supabase/functions/download-track/index.ts` is deployed as a Supabase Edge Function (Deno serverless). It handles download tracking without any persistent server.

### ✅ Managed Database
Supabase provides a fully managed PostgreSQL instance. No database server administration required — backups, replication, and patching are handled by Supabase.

### ✅ Observability
- **Function logs** — Supabase Dashboard → Edge Functions → each function has real-time log streaming
- **Database metrics** — Supabase Dashboard → Reports → shows query count, slow queries, table sizes, active connections
- **Download analytics** — `download_logs` table provides a queryable time-series of all download events
- **Frontend** — Vercel Analytics tracks page views, Core Web Vitals, and geographic distribution

### ✅ Cost Controls
The project runs entirely on free tiers:
- **Supabase Free**: 500MB database, 1GB storage, 5GB bandwidth, 2M Edge Function invocations/month
- **Vercel Free**: 100GB bandwidth/month, unlimited hobby deployments

Usage alerts are configured in Supabase Dashboard → Settings → Billing. Vercel spend limits can be set under project settings.

---

## 4. Local Development Setup

1. Clone repo and run `npm install`
2. Create a Supabase project at supabase.com (free)
3. Run `supabase/migrations/001_initial.sql` in the SQL Editor
4. Create the `mod-assets` storage bucket (public)
5. Copy `.env.example` to `.env.local`, fill in project URL and anon key
6. Run `npm run dev` → opens at http://localhost:5173

---

## 5. Deployment

**Frontend → Vercel:**
```
npm run build        # produces dist/
vercel               # auto-detects Vite, deploys to CDN
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Vercel project settings.

**Edge Functions → Supabase:**
```
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase functions deploy mods
supabase functions deploy download-track
```

---

## 6. Security Considerations

- RLS policies are the primary security layer — even if the anon key is exposed (it is, in the frontend bundle), users cannot access or modify other users' data
- The service role key is never used in the frontend; it is only used in Edge Functions via `Deno.env`
- Storage policies prevent users from uploading to other users' path prefixes
- File type validation is done client-side with `accept=` attributes; server-side MIME validation can be added to the upload Edge Function
- Passwords are hashed by Supabase Auth (bcrypt); the application never handles raw passwords

---

## 7. Potential Improvements

- Full-text search using PostgreSQL `tsvector` / `pg_trgm`
- Mod versioning (multiple file versions per mod)
- Comments / ratings system
- Email notifications on new downloads (via Supabase Webhooks + Resend)
- Admin moderation dashboard
- File size limits enforced server-side in the upload Edge Function
