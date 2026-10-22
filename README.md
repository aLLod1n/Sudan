# Darna — دارنا

Property listings for Sudan (rent and sale) with Arabic (RTL, default) and English. Built with Next.js 16, Prisma 7 + PostgreSQL, Tailwind v4, shadcn/ui and next-intl.

> This README covers setup. It will be completed in step 7 (deployment, cron, storage).

## Requirements

- Node.js 20.9+ (tested on 24)
- No PostgreSQL install needed for development: `npm run db` runs a local PostgreSQL from npm.

## Setup

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Environment
cp .env.example .env
#    then set BETTER_AUTH_SECRET (command is in the file) and ADMIN_PHONE

# 3. Start the local database — keep this terminal open
npm run db

# 4. In a second terminal: create tables and load sample data
npx prisma migrate deploy
npm run db:seed

# 5. Run the site
npm run dev
```

Open http://localhost:3000 (Arabic) or http://localhost:3000/en (English).

### Logging in during development

Login is phone number + 6-digit code. With `OTP_PROVIDER="console"` no SMS is sent: the code is printed in the terminal running `npm run dev`, as `[OTP] +249… → 123456`.

- Admin: the number in `ADMIN_PHONE` (the seed makes it ADMIN).
- Sample agents: `911000001`, `911000002`. Sample owners: `911000003`, `911000004`.
- Any other valid Sudanese number creates a new account on first login.

Limits: 3 codes per number per 10 minutes, 10 per day, 10 per IP per hour; 5 wrong attempts per code.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server (the build does not need the database) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db` | Local embedded PostgreSQL on port 54329 (data in `.postgres-data/`); Ctrl+C stops it |
| `npm run db -- stop` | Stop a local database left running in the background |
| `npm run db:migrate` | Create and apply a new migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Cities, neighbourhoods, admin user, sample listings (safe to re-run) |
| `npm run db:studio` | Prisma Studio (database browser) |

## Project layout

```
app/[locale]/        pages (ar has no URL prefix, en is under /en)
app/api/files/       serves locally stored photos in development
components/ui/       shadcn/ui components, re-themed to docs/DESIGN.md
components/…         layout, listing and search components
i18n/                next-intl routing and request config
messages/            ar.json, en.json — all UI text
lib/                 prisma, storage, images, phone, rate limit, sanitize, data queries
prisma/              schema, migrations, seed
scripts/             dev database, cron jobs
docs/DESIGN.md       design reference
```
