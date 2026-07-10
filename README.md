# Forge v1.0

Cutthroat, winner-take-all weekly competition app. Full PRD context lives in this repo's
conversation history; this README covers running the v1 scaffold.

## Layout

```
/app                  Expo (React Native) client
/supabase
  /migrations          SQL schema
  /functions           Deno edge functions (submit-entry, grade-week, stakes-ante)
/packages/shared        Shared TypeScript types + grading/notification contracts
```

## Prerequisites

- Node 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase` or see docs)
- Docker (required by `supabase start` for local Postgres/Auth/Storage)
- Expo Go app on your phone, or an iOS/Android simulator

## Local setup

```bash
npm install
cp .env.example .env          # fill in values as you go
cp .env.example app/.env      # Expo reads its own .env in /app

supabase start                # boots local Postgres, Auth, Studio, Inbucket
supabase db reset             # applies migrations/0001_init.sql + seed.sql
```

`supabase start` prints a local API URL and anon key — copy those into
`app/.env` as `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Then:

```bash
npm run dev                   # starts Expo for the app workspace
```

Log in with one of the seeded emails (`james@forge.dev`, `angus@forge.dev`, ...) —
local Supabase catches the magic-link email in Inbucket at `http://localhost:54324`.

## Edge functions locally

```bash
supabase functions serve --env-file .env
```

- `submit-entry` — Sunday Portal submission (time + char-cap gated server-side)
- `grade-week` — the AI grading loop. Leave `OPENAI_API_KEY` unset in `.env` and it
  falls back to a deterministic mock grader, so you can exercise the full rank/points/pot
  pipeline without spending API credits. Trigger manually with:
  ```bash
  curl -X POST http://localhost:54321/functions/v1/grade-week \
    -H "Authorization: Bearer <service-role-key>"
  ```
- `stakes-ante` — Stakes Room ante/nuke endpoint

In production, schedule `grade-week` via Supabase's `pg_cron` (or a Vercel Cron job
hitting the deployed function URL) for Monday 8:00 AM in your target timezone.

## Going live

Swap placeholders in `.env` / `app/.env` for real values:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from your hosted Supabase project
- `OPENAI_API_KEY` — enables real GPT-4o-mini grading instead of the mock fixture
- `EXPO_ACCESS_TOKEN` — enables real push delivery instead of the console-log no-op

## Explicitly out of scope for this pass

- Real money movement/payouts (would need Stripe or similar)
- Production push certificates (APNs/FCM project setup)
- App store submission
- Sound/particle assets for the Monday Reveal cinematic (hooks are stubbed with `// TODO` markers)
