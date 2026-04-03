# Booking System

A full-stack appointment booking application built with Next.js 16. Customers browse service providers, pick a date and time slot, and receive a booking confirmation. Providers are configured with weekly availability windows; the system generates 30-minute slots and avoids double-booking.

**Live demo:** https://kkaranveer6.github.io/booking-system-demo/

---

## Features

- **Provider directory** — browse available service providers with name and bio
- **3-step booking flow** — pick a date, choose a time slot, enter contact details
- **Smart slot generation** — generates 30-minute slots from provider availability windows, skipping already-booked times
- **Booking confirmation** — summary page with provider, date/time, and customer details
- **Google Calendar link** — one-click "Add to Google Calendar" on the confirmation page
- **Email notifications** — sends confirmation emails via [Resend](https://resend.com) (can be disabled with an env var)
- **Demo mode** — persistent banner and fake booking flow for portfolio/demo deployments
- **Static export** — builds to fully static HTML for GitHub Pages or any CDN

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | Radix UI primitives |
| Database | PostgreSQL via Prisma |
| Email | Resend |
| Testing | Vitest |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Data Model

```
Provider
  ├── id, name, slug, bio, email, imageUrl
  ├── availability: AvailabilityWindow[]   (dayOfWeek, startTime, endTime)
  └── bookings: Booking[]

Booking
  ├── id, providerId
  ├── customerName, customerEmail
  ├── startsAt, endsAt
  ├── status: confirmed | cancelled
  └── notes?
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker)

### Install

```bash
npm install
```

### Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `RESEND_API_KEY` | API key from resend.com |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `NEXT_PUBLIC_BASE_URL` | Base URL of your deployment |
| `DISABLE_EMAIL` | Set to `true` to skip sending emails |
| `NEXT_PUBLIC_DEMO_BANNER` | Set to `true` to show the demo banner |

### Database setup

```bash
npx prisma migrate dev
npm run seed          # seed demo providers
npm run seed:reset    # wipe and re-seed
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test          # run once
npm run test:watch  # watch mode
```

Tests cover slot generation logic and email template rendering.

---

## Deployment

### GitHub Pages (demo mode)

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds a fully static export and deploys to GitHub Pages. It sets `NEXT_PUBLIC_DEMO_BANNER=true` so visitors see a "demo only" notice, and the booking flow navigates client-side without hitting any backend.

To deploy your own copy:

1. Fork the repo
2. Go to **Settings → Pages** and set the source to **GitHub Actions**
3. Push to `main` — the workflow runs automatically

### Production (with database)

Deploy to any Node.js host (Vercel, Railway, Fly.io, etc.) with the environment variables above and a live PostgreSQL database.

---

## Project Structure

```
src/
  app/
    page.tsx                  # provider directory (home)
    [slug]/
      page.tsx                # provider profile + booking entry
      BookingFlow.tsx         # 3-step booking UI (client component)
    booking/
      confirm/page.tsx        # confirmation page
  components/
    DemoBanner.tsx            # demo-mode top bar
    ui/                       # button, card, input, label
  lib/
    slots.ts                  # slot generation logic
    email.ts                  # Resend email wrapper
    email-templates.ts        # confirmation email copy
    db.ts                     # Prisma client singleton
  data/
    providers.json            # static demo provider data
prisma/
  schema.prisma               # database schema
scripts/
  seed.ts                     # database seeder
```
