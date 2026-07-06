# 海那边 lesson portal

A bilingual Next.js website and local portal for one Chinese tutor. Parents can sign in to view teacher-managed learners, lesson balances, completed lessons, Ziina invoices, and a Google Appointment Schedule. The teacher manages all portal data.

The repository supports local development and a Docker-based production deployment through Cloudflare Tunnel. It intentionally does not integrate the Google Calendar API, Ziina API, or payment webhooks.

## Requirements

- Node.js 20.9 or newer
- npm
- Docker Desktop (for PostgreSQL and Mailpit)

## First-time setup

```bash
cp .env.example .env.local
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

- Website: `http://localhost:3000` (redirects to `/zh`)
- Mailpit inbox for sign-in codes: `http://localhost:8025`

The safe reset command only accepts a PostgreSQL URL on `localhost`, `127.0.0.1`, or `::1`:

```bash
npm run db:reset
```

## Environment

Copy `.env.example` to `.env.local`, then set:

- `DATABASE_URL` — local PostgreSQL connection.
- `BETTER_AUTH_SECRET` — at least 32 random characters.
- `BETTER_AUTH_URL` — normally `http://localhost:3000`.
- `TEACHER_EMAIL` — the one email that receives the `teacher` role when first registered.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — optional locally; both are needed for the Google button. Add `http://localhost:3000/api/auth/callback/google` as the authorized redirect URI in Google.
- `GOOGLE_BOOKING_URL` — the published Google Appointment Schedule URL. Only Google Calendar booking hosts are embedded.
- `SMTP_*` and `EMAIL_FROM` — the defaults target local Mailpit.

If an email was registered before it was set as `TEACHER_EMAIL`, reset the local database or update the prototype record before signing in again.

## Local workflow

1. The parent signs in using Google or a six-digit email code.
2. The teacher signs in with the exact `TEACHER_EMAIL` and opens `/en/admin` or `/zh/admin`.
3. The teacher adds a learner using the registered parent email.
4. The teacher creates a one- or ten-lesson package and pastes its real `https://pay.ziina.com/...` invoice link.
5. Recording a lesson consumes one immutable ledger credit per selected learner. Voiding it adds a restoring ledger entry.
6. Ziina status is updated manually after its notification.

Package use is independent of payment status. Google owns booking availability and conflict prevention; no bookings are copied to PostgreSQL.

## Database commands

```bash
npm run db:migrate
npm run db:seed
npm run db:reset
npm run db:studio
```

The migration includes database-level guards that reject credit-ledger edits/deletions and any entry that would produce a negative balance.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

AED is stored as integer fils. Database timestamps use UTC-capable `timestamptz`; portal dates are displayed in `Asia/Dubai`.

## Production deployment

Production uses a separate Compose stack with:

- A non-root Next.js standalone container.
- PostgreSQL on an internal-only Docker network and persistent volume.
- Cloudflare Tunnel with no public application or database ports.
- Strict production environment validation.
- Database-aware container health checks.

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) exactly. Do not use the local `compose.yaml` on the VPS.
