# Build 2 — Custom CRM (Next.js + Supabase)

**Live:** https://ops-tracker-topaz.vercel.app
**Manager dashboard:** https://ops-tracker-topaz.vercel.app/dashboard (PIN: `1234` — change this, see below)

Next.js 16 (App Router) + Tailwind, Supabase Postgres, hosted on Vercel.
No employee login — pick your name and go, same friction as a Google Form.
The manager dashboard is behind one shared PIN, not per-user auth.

## What's where

- `/daily-update`, `/lead-gen` — the two entry forms. Mobile-first, big tap
  targets, conditional sections reveal inline (no page reloads). Name auto-
  fills Department for real (unlike the Forms build, which can't do this).
- `/dashboard` — Red Flags (auto-filtered, red/yellow), Submission tracker,
  Lead pipeline snapshot, department/project filters, CSV export.
- `/dashboard/admin` — add/edit/deactivate Employees and Projects; entry
  forms pick this up immediately, no redeploy needed.
- `lib/` — Supabase client, data access, PIN session token.
- `supabase/migrations/0001_init.sql` — full schema. `supabase/seed.sql` —
  placeholder Employees/Projects (already applied to the live project —
  replace via `/dashboard/admin` before rollout).

## First thing to do: change the PIN

The live deploy is using the placeholder PIN `1234`. To change it:

```bash
npx vercel env rm DASHBOARD_PIN production
```

```bash
echo "your-new-pin" | npx vercel env add DASHBOARD_PIN production
```

```bash
npx vercel --prod
```

## Local development

```bash
npm install
npm run dev
```

Needs `.env.local` (already present in this checkout, gitignored) with:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
DASHBOARD_PIN=...
DASHBOARD_PIN_SECRET=...
```

See `.env.example` for the shape. `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`
are in the Supabase dashboard under Project Settings → API (project ref
`uurukgudfmzsnohyufpn`, org "Ops Tracker"). `DASHBOARD_PIN_SECRET` is a
random signing key for the session cookie — not typed by anyone, generate
a new one with `openssl rand -hex 32` if you ever need to rotate it (doing
so invalidates all logged-in dashboard sessions).

## Redeploying after a code change

```bash
npx vercel --prod
```

## Schema changes

Add a new file under `supabase/migrations/`, then:

```bash
npx supabase db push
```

(Already linked to the live project via `supabase link` — no need to
re-link unless you're on a fresh machine.)

## Notes on choices made

- **RLS is on, no policies.** Only the service-role key (server-only, used
  in `lib/supabase.ts`) can read or write. The anon key is never used, so
  there's no public write surface despite there being no per-user auth.
- **PIN session** is a stateless signed cookie (HMAC over an expiry
  timestamp), not a database-backed session table — there's exactly one
  PIN and no per-user state to track, so a session store would be pure
  overhead.
- **Red Flags are computed live** from `daily_updates` on every dashboard
  request (one query, unpivoted in JS) rather than a stored table — this
  is the one place Build 2 is structurally simpler than the Forms/Sheets
  build, which needs a precomputed helper sheet because plain Sheets
  formulas can't unpivot.
- Next.js 16 renamed Middleware to **Proxy** (`proxy.ts`, not
  `middleware.ts`) — same mechanics, new file name. If you're used to
  older Next.js docs, that's the one convention that changed underneath
  this app.
