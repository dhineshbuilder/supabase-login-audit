# Supabase Login Audit App

This is a small full stack Supabase assessment project.

It demonstrates:

- Google login using Supabase Auth
- Supabase Postgres database storage
- Row Level Security policies
- Postgres RPC function
- Supabase Edge Function/API deployment
- Frontend table showing who logged in and when

## Project Flow

```text
User opens frontend URL
  -> clicks Continue with Google
  -> Supabase Auth handles OAuth
  -> frontend receives the session
  -> frontend calls record_login_event() RPC
  -> Postgres stores login event
  -> frontend displays login history
```

## Files

```text
supabase/migrations/20260531000000_create_login_events.sql
  Database table, indexes, RLS policies, and RPC function.

supabase/functions/login-app/index.ts
  Supabase Edge Function used as the deployed Edge Function/API part.

docs/index.html
  Working frontend for Google login and login history.

supabase/config.toml
  Marks login-app as a public Edge Function so the frontend can call it before authentication.

.env.example
  Example Supabase environment variables.

SUPABASE_FULLSTACK_ASSESSMENT.md
  Explanation and planning document for the assessment.
```

## Database Schema

Table: `public.login_events`

| Column | Type | Description |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Supabase Auth user ID |
| `email` | `text` | User email from Google/Auth JWT |
| `full_name` | `text` | User name from Google metadata |
| `avatar_url` | `text` | Google profile image URL |
| `logged_in_at` | `timestamptz` | Login timestamp |

## RLS

RLS is enabled on `public.login_events`.

Policies:

- Authenticated users can view login events.
- Authenticated users can insert only records where `user_id = auth.uid()`.

This protects the database even though the browser uses a public Supabase key.

## RPC

Function: `public.record_login_event()`

The frontend calls:

```js
await supabase.rpc('record_login_event')
```

The frontend does not send `user_id`. The database gets the authenticated user from `auth.uid()` and gets user metadata from `auth.jwt()`.

## Edge Function

Function name: `login-app`

Supabase Edge Functions are used for the Edge Function requirement. The deployed function exposes JSON status and health responses.

Important production note:

Supabase hosted Edge Functions do not support HTML rendering. Supabase's docs say `GET` requests returning `text/html` are rewritten to `text/plain`, which makes the browser show the HTML source. For that reason, the working frontend is in:

```text
docs/index.html
```

The frontend still uses Supabase Auth, RLS, RPC, and the Supabase database.

The Edge Function uses these default Supabase environment values:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEYS`

Hosted Supabase Edge Functions receive these default values automatically. For local testing, this project also supports `APP_SUPABASE_URL`, `APP_SUPABASE_PUBLISHABLE_KEY`, and `APP_SUPABASE_ANON_KEY`.

The function is public because users must open the login page before they have a JWT:

```toml
[functions.login-app]
verify_jwt = false
```

The database is still protected by Supabase Auth, RLS policies, and the RPC function.

## Supabase Setup

### 1. Create a Supabase project

Create a project in the Supabase dashboard and copy:

- Project URL
- Publishable key or anon key
- Project ref

### 2. Apply the migration

If your project is linked with Supabase CLI:

```bash
supabase db push
```

Or open Supabase SQL Editor and run:

```text
supabase/migrations/20260531000000_create_login_events.sql
```

### 3. Enable Google Auth

In Supabase Dashboard:

1. Go to Authentication.
2. Open Providers.
3. Enable Google.
4. Add Google Client ID and Client Secret.

In Google Cloud Console:

- Create an OAuth client ID for a web app.
- Add your app origin as an authorized JavaScript origin.
- Add the Supabase Auth callback URL as an authorized redirect URI.

The callback URL is shown in the Supabase Google provider settings and usually looks like:

```text
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

### 4. Add Auth redirect URL

In Supabase Dashboard:

1. Go to Authentication.
2. Open URL Configuration.
3. Add your deployed frontend URL to Redirect URLs.

For GitHub Pages, the URL will look like:

```text
https://<github-username>.github.io/<repo-name>/
```

For local testing, also add:

```text
http://localhost:4173/
```

## Edge Function Environment

For hosted deployment, no custom secrets are required because Supabase provides default Edge Function environment variables.

For local testing, create a `.env` file:

```env
APP_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
APP_SUPABASE_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
```

If your project only has an anon key:

```env
APP_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
```

## Local Development

Login and link the Supabase project:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```

Serve the function locally:

```bash
supabase functions serve login-app --env-file .env
```

If your local CLI does not pick up `supabase/config.toml`, run:

```bash
supabase functions serve login-app --env-file .env --no-verify-jwt
```

Open:

```text
http://localhost:54321/functions/v1/login-app
```

## Deployment

Deploy the database changes:

```bash
supabase db push
```

Deploy the Edge Function:

```bash
supabase functions deploy login-app
```

Open:

```text
https://<PROJECT_REF>.supabase.co/functions/v1/login-app
```

This Edge Function URL returns JSON. The working app should be hosted from `docs/index.html` using GitHub Pages, Netlify, Vercel, or any static hosting provider.

## Frontend Deployment

### Option A: GitHub Pages

1. Push this project to a GitHub repository.
2. Open repository Settings.
3. Go to Pages.
4. Choose `Deploy from a branch`.
5. Choose branch `main`.
6. Choose folder `/docs`.
7. Save.

Your frontend URL will look like:

```text
https://<github-username>.github.io/<repo-name>/
```

Add that URL in Supabase Dashboard:

```text
Authentication -> URL Configuration -> Redirect URLs
```

Also add the same URL as an authorized JavaScript origin in Google Cloud OAuth.

### Option B: Netlify

Drag and drop the `docs` folder into Netlify.

Then add the Netlify URL to:

- Supabase Auth redirect URLs
- Google OAuth authorized JavaScript origins

### Option C: Vercel

This repository includes `vercel.json`, so Vercel serves the app from:

```text
docs/index.html
```

Deploy steps:

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Choose framework preset `Other`.
4. Leave build command empty.
5. Deploy.

Then add the Vercel URL to:

- Supabase Auth redirect URLs
- Google OAuth authorized JavaScript origins

Example:

```text
https://supabase-login-audit.vercel.app/
```

## Testing Checklist

- Google login redirects correctly.
- User returns to the frontend URL after login.
- A row is inserted into `login_events`.
- Frontend shows email/name/login time.
- Logout works.
- Logged-out users cannot read login events.
- RPC fails for logged-out users.
- The browser never receives the service role key.

## Submission Message

```text
Hi, I have completed the Supabase full stack assessment.

GitHub Repository:
<repo-link>

Live Demo:
<frontend-hosting-link>

Supabase Edge Function:
https://<PROJECT_REF>.supabase.co/functions/v1/login-app/health

Demo Video:
<video-link>

Implemented:
- Google login using Supabase Auth
- Supabase Postgres database for login history
- RLS policies for protected access
- RPC function to record login events
- Supabase Edge Function/API deployment
- Frontend showing users and login timestamps
```

## Official Docs Used

- Supabase Auth: https://supabase.com/docs/guides/auth
- Google login: https://supabase.com/docs/guides/auth/social-login/auth-google
- Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Edge Functions: https://supabase.com/docs/guides/functions
- Supabase JS OAuth: https://supabase.com/docs/reference/javascript/auth-signinwithoauth
- Supabase JS RPC: https://supabase.com/docs/reference/javascript/rpc
