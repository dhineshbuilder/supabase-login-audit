# Supabase Full Stack Assessment Guide

## Task Summary

The assessment asks for a small Supabase hands-on project that demonstrates:

- Google login with Supabase Auth
- Supabase Postgres database
- Row Level Security
- RPC / Postgres function
- Supabase Edge Function
- Frontend showing who logged in and when

## Final Project Approach

This project is a **Supabase Login Audit App**.

Flow:

```text
User opens frontend URL
  -> signs in with Google
  -> Supabase Auth creates a session
  -> frontend calls record_login_event() RPC
  -> Supabase Postgres stores the login event
  -> RLS protects access
  -> frontend displays login history
```

## Important Supabase Edge Function Note

Supabase hosted Edge Functions currently do **not** render HTML pages directly. Supabase documentation says `GET` requests returning `text/html` are rewritten to `text/plain`, which is why the browser shows raw HTML source when opening the Edge Function URL.

Because of that:

- `docs/index.html` is the working frontend.
- `supabase/functions/login-app/index.ts` is the deployed Supabase Edge Function/API part.
- The database, Auth, RLS, and RPC are still fully on Supabase.

## Main Files

```text
docs/index.html
```

Working frontend with Google login, login recording, and login history table.

```text
supabase/migrations/20260531000000_create_login_events.sql
```

Creates the database table, indexes, RLS policies, and RPC function.

```text
supabase/functions/login-app/index.ts
```

Supabase Edge Function with JSON status/health endpoint.

```text
README.md
```

Setup, deployment, and submission instructions.

## What to Submit

Send:

- GitHub repository link
- Live frontend link from GitHub Pages, Netlify, or Vercel
- Supabase Edge Function health link
- Short demo video

Example:

```text
GitHub Repository:
<repo-link>

Live Frontend:
<frontend-hosting-link>

Supabase Edge Function:
https://hzppujksrtwktfmhjoqf.supabase.co/functions/v1/login-app/health

Demo Video:
<video-link>
```
