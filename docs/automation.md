# Automation Playbook

This document gives non-interactive agents (and humans using automation) enough context to safely edit, test, and deploy the aer berlin platform. Follow these conventions to avoid breaking production or security posture.

## Environment & Tooling

| Requirement | Notes |
|-------------|-------|
| Node.js 20.x | Use `nvm install 20 && nvm use 20` or system Node ≥ 20.11. |
| npm 10.x | Ships with Node 20. |
| PostgreSQL 15+ | Local dev uses `DATABASE_URL`; Neon/Vercel Postgres are compatible. |
| Sanity CLI | Needed for `npm run sanity:*` commands. |
| Pretix + Stripe credentials | Required in non-mock environments. |

### Repository Map

- `src/app` – Next.js App Router pages + API routes.
- `src/components` – UI primitives (motion, layout, portable text).
- `src/server` – Server-only helpers (Sanity, Pretix, tickets, auth).
- `prisma` – Schema, migrations, and database seed helpers.
- `sanity` – Sanity Studio configuration.
- `docs` – Internal documentation (this file, design notes).

## Setup Checklist

```bash
git clone <repo>
cd aerberlin
npm install
cp .env.example .env.local   # create if missing
npm run prisma:generate
npm run db:push              # requires DATABASE_URL
```

Set the following **must-have** variables in `.env.local` (or platform-specific secret store). Never rely on the defaults defined in `src/lib/env.ts` when `NODE_ENV=production`.

### Core secrets

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. |
| `NEXTAUTH_SECRET` | 32+ byte random secret (`openssl rand -base64 32`). |
| `PREVIEW_USER` / `PREVIEW_PASS` | Credentials for middleware basic auth protection. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | Admin credential pair if using credential sign-in in production (hash via `bcrypt`). |

### Sanity

| Variable | Purpose |
|----------|---------|
| `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION` | Studio + GROQ config. |
| `SANITY_WRITE_TOKEN` | Required for seeding/publishing via API. |
| `SANITY_PREVIEW_SECRET` | Used to validate Sanity webhooks. |

### Pretix & Tickets

| Variable | Purpose |
|----------|---------|
| `PRETIX_API_URL`, `PRETIX_API_TOKEN` | Pretix REST access. |
| `PRETIX_CHECKIN_LIST_ID` | Pretix check-in list for scans. |
| `PRETIX_WEBHOOK_SECRET` | Shared secret for Pretix webhooks (HMAC). |
| `PRETIX_ORGANIZER_SLUG` / `PRETIX_EVENT_SERIES_SLUG` | Catalog helper values. |

### Stripe

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side API key. |
| `STRIPE_PUBLISHABLE_KEY` | Client-side key. |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret. |

### Email & Marketing

| Variable | Purpose |
|----------|---------|
| `EMAIL_SERVER_HOST/PORT/USER/PASSWORD` | SMTP for next-auth magic links. |
| `BUTTONDOWN_API_KEY`, `BUTTONDOWN_AUDIENCE_ID` | Newsletter sync. |
| `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX` | Optional Mailchimp integration. |

### Analytics

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_PLAUSIBLE_ENABLED`, `PLAUSIBLE_DOMAIN` | Plausible script toggle. |
| `NEXT_PUBLIC_GA4_ENABLED`, `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` | GA4 integration. |

### Mock Toggles

Set these to `"false"` in production; leave as `"true"` for isolated local work:

- `USE_MOCK_SANITY`
- `USE_MOCK_PRETIX`
- `USE_MOCK_STRIPE`
- `USE_MOCK_AUTH`

## Daily Command Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build production bundle | `npm run build` |
| Start production server | `npm run start` (needs `npm run build` first) |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test:unit` |
| E2E tests | `npm run test:e2e` |
| Format | `npm run format` |
| Seed Sanity content | `npm run seed` (requires `SANITY_WRITE_TOKEN`) |
| Sanity Studio dev | `npm run sanity:dev` |

Always run `lint`, `typecheck`, and the relevant test suite after making code changes. For deployment builds, execute `npm run build` to catch App Router regressions before pushing artifacts.

## Coding Conventions

1. **TypeScript first** – Add/adjust types when touching APIs or components.
2. **Immutable config** – Never hard-code secrets; read from `env`.
3. **Use `apply_patch` or equivalent** – Keep diffs minimal and reviewable.
4. **Tests before deploy** – New logic needs at least unit tests; ticketing/auth changes should include integration or E2E coverage.
5. **Accessibility & i18n** – Pages live under `/[locale]`; respect `next-intl` utilities.
6. **Security** – Follow the risk analysis recommendations (basic auth middleware, webhook HMAC verification, price validation, etc.). Automation must not disable guards without explicit approval.

## Deployment Guidance

### Vercel / Platform Deploy

1. Ensure secrets are configured via the hosting provider (`vercel env`, Docker secrets, etc.).
2. Run `npm run build` locally; fix any failures.
3. Push to `main` or open a PR; CI runs lint, typecheck, Vitest, and Playwright.
4. After deploy, verify:
   - `/api/tickets/checkout` works with real Pretix/Stripe data.
   - Webhook endpoints respond with `401` to unsigned requests.
   - Middleware basic auth challenges unauthenticated visitors on preview/staging.

### Bare-metal / Custom Server

1. Build: `npm run build`.
2. Serve: `PORT=3000 NODE_ENV=production npm run start` behind a reverse proxy (Nginx/Caddy) handling HTTPS + HTTP→HTTPS redirects.
3. Use `pm2`, `systemd`, or Docker to keep the process alive.
4. Configure firewall/WAF rules limiting access to trusted IPs if the site is meant to be private.
5. Enable log shipping (stdout/stderr) to your monitoring stack.

## Workflow for AI Agents

1. **Sync** – Fetch latest `main`, confirm clean working tree (`git status`).
2. **Plan** – Outline tasks before editing (especially multi-step changes).
3. **Implement** – Edit files using deterministic tools (`apply_patch`, `sed`, etc.).
4. **Validate** – Run `npm run lint`, `npm run typecheck`, and appropriate tests. For changes affecting builds, also run `npm run build`.
5. **Document** – Update README/docs/tests when behavior changes.
6. **Report** – Summarize modifications, reference files/lines, and mention any skipped validations.

## Troubleshooting

- **Missing Prisma Client**: Run `npm run prisma:generate`.
- **Sanity auth errors**: Ensure `SANITY_WRITE_TOKEN` has `editor` rights.
- **Stripe webhook failures**: Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in dev; update `STRIPE_WEBHOOK_SECRET`.
- **Pretix 401s**: Confirm `PRETIX_API_TOKEN` belongs to the organizer and IP is allowlisted.

## Security Reminders

- Never commit `.env*` files or production credentials.
- Rotate `PREVIEW_PASS`, webhook secrets, and API tokens after sharing them with third parties or automation.
- Enforce MFA on Sanity, Pretix, Stripe, and hosting dashboards.
- Review logs for repeated 401/429 events; investigate anomalies before redeploying.

Keeping this playbook current ensures automated teammates can operate with the same context as human maintainers. Update the document whenever commands, secrets, or workflows evolve.
