# aer berlin Platform

High-contrast Next.js 15 web app for the Berlin trance collective aer berlin. Provides multilingual editorial pages powered by Sanity CMS, ticketing via Pretix + Stripe, and operations tooling for check-in staff.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion, subtle hover states respecting reduced-motion
- **CMS**: Sanity v3 with Studio mounted at `/studio`
- **Data**: PostgreSQL via Prisma (Vercel Postgres / Neon compatible)
- **Auth**: next-auth (magic link email) with Prisma adapter
- **Ticketing**: Pretix REST API + Stripe Checkout; QR validation console for door staff
- **Testing**: Vitest (unit), Playwright (e2e)
- **Tooling**: ESLint, Prettier, GitHub Actions CI, Plausible analytics hook

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in secrets, especially DATABASE_URL and Pretix/Stripe keys
npm run prisma:generate
npm run dev
```

The app defaults to `http://localhost:3000`. Routes are prefixed with `/en` or `/de`.

Mock toggles in `.env.local` (`USE_MOCK_SANITY`, `USE_MOCK_PRETIX`, `USE_MOCK_STRIPE`, `USE_MOCK_AUTH`) are enabled by default so you can browse the UI without external services. Set them to `false` once real integrations are wired.

### Database & Prisma

Create the schema locally:

```bash
npm run db:push
```

Prisma models cover ticket orders, items, and check-in logs for Pretix interactions.

### Sanity Studio & Seed

Sanity Studio lives at `/studio` and uses project/dataset from the environment.

Seed example content (events, artists, releases, pages) once you set `SANITY_WRITE_TOKEN`:

```bash
npm run seed
```

Run Sanity locally:

```bash
npm run sanity:dev
```

### Pretix & Stripe Integration

- `PRETIX_API_URL` should point to your organizer endpoint (e.g. `https://pretix.eu/api/v1/organizers/aerberlin`).
- `PRETIX_CHECKIN_LIST_ID` represents the Pretix check-in list to use for QR validation.
- `PRETIX_WEBHOOK_SECRET` is matched against the `x-pretix-signature` header.
- Stripe Checkout sessions store the Prisma order id in metadata; Stripe webhooks complete the order record.
- Pretix webhooks update orders and append check-in logs; adapt the payload mapping as you refine your Pretix setup.

### Authentication

Magic-link email sign-in is enabled via next-auth Email provider. Configure SMTP credentials in `.env.local`. Protected routes such as `/checkin` require role `STAFF` or `ADMIN` on the Prisma `User` model.

### Testing

```bash
npm run test:unit     # Vitest
npm run test:e2e      # Playwright (starts dev server automatically)
```

Playwright uses `playwright.config.ts` with a local dev server; override `PLAYWRIGHT_BASE_URL` for remote runs.

### Linting & Type Safety

```bash
npm run lint
npm run typecheck
```

### GitHub Actions

`.github/workflows/ci.yml` runs lint, typecheck, Vitest, and Playwright on pushes/PRs targeting `main`.

### Deployment

Deploy to Vercel:

1. Provision Vercel Postgres and set `DATABASE_URL`.
2. Configure Sanity dataset + API token, Pretix + Stripe secrets, analytics toggles.
3. Add `NEXTAUTH_SECRET` (use `openssl rand -base64 32`).
4. Enable webhooks:
   - Pretix → `https://your-domain/api/webhooks/pretix`
   - Stripe → `https://your-domain/api/webhooks/stripe`
   - Sanity → `https://your-domain/api/webhooks/sanity`

### Operations

- `/checkin` provides camera-based Pretix QR validation (requires STAFF/ADMIN).
- `/tickets` pulls Pretix catalog data and launches Stripe Checkout.

### Scripts

- `npm run format` – Prettier with Tailwind plugin
- `npm run prisma:migrate` – Create a new migration
- `npm run prisma:deploy` – Apply migrations in production
- `npm run seed` – Push starter content into Sanity

## Automation & AI Agents

An AI helper can follow the step-by-step playbook in [`docs/automation.md`](docs/automation.md) to install dependencies, manage environment variables, run checks, and deploy safely. Keep that document updated whenever the workflow changes so automated contributors stay in sync with human operators.

## Repository

Primary remote: [`moshfu/aerberlin`](https://github.com/moshfu/aerberlin). Pushes to `main` follow the deployment workflow described in the automation playbook.

## License

MIT
