# Production deployment: OVH VPS + Cloudflare

This deployment runs the Next.js app, PostgreSQL, and Cloudflare Tunnel in Docker. It publishes no host ports for the app or database.

The instructions assume a fresh Ubuntu 24.04 VPS, Docker Engine with the Compose plugin, a Git remote containing this repository, and a Cloudflare-managed `hainabian.org` zone.

## 1. Create the external credentials

Complete these before starting the containers:

1. In Cloudflare Zero Trust, create a remotely managed tunnel named `hainabian-production`.
2. Add the public hostname `hainabian.org` with service URL `http://app:3000`.
3. Add `www.hainabian.org` as a second hostname or redirect it to the apex domain.
4. Copy the tunnel token. Do not add an `A` record pointing at the VPS.
5. In Google Cloud, create a Web OAuth client with:
   - JavaScript origin: `https://hainabian.org`
   - Redirect URI: `https://hainabian.org/api/auth/callback/google`
6. Publish a Google Appointment Schedule and copy its booking URL.
7. Verify `auth.hainabian.org` with the chosen transactional email provider. For Resend, use SMTP host `smtp.resend.com`, user `resend`, and port `587`.

## 2. Clone the repository

Run as the non-root deployment user:

```bash
sudo mkdir -p /opt/hainabian
sudo chown "$USER":"$USER" /opt/hainabian
git clone YOUR_GIT_REPOSITORY_URL /opt/hainabian
cd /opt/hainabian
```

For a private repository, configure a read-only Git deploy key instead of storing a personal access token in the clone URL.

## 3. Create the production environment

```bash
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -hex 32
openssl rand -base64 48
nano .env.production
```

Use the hex value as `POSTGRES_PASSWORD`. Put the identical value into the password section of `DATABASE_URL`. Use the base64 value as `BETTER_AUTH_SECRET`.

Replace every `change-me` value. In particular:

- `TEACHER_EMAIL` must be the teacher's exact sign-in email before her first login.
- `PRIVACY_CONTACT_EMAIL` must be a monitored address shown on the privacy page.
- `EMAIL_FROM` should be an approved sender such as `Hai Na Bian <login@auth.hainabian.org>`.
- `CLOUDFLARE_TUNNEL_TOKEN` is a secret and must not be committed.

Check that no placeholders remain:

```bash
grep -n "change-me" .env.production
```

The command should print nothing.

## 4. Build and validate

All production Compose commands must include the environment file:

```bash
docker compose --env-file .env.production -f compose.production.yaml config
docker compose --env-file .env.production -f compose.production.yaml build app migrate
docker compose --env-file .env.production -f compose.production.yaml --profile tools run --rm migrate npm run validate:env
```

The final command must report `Production environment is valid.` Fix every reported problem before continuing.

## 5. Create and migrate the database

```bash
docker compose --env-file .env.production -f compose.production.yaml up -d postgres
docker compose --env-file .env.production -f compose.production.yaml --profile tools run --rm migrate npm run deploy:migrate
docker compose --env-file .env.production -f compose.production.yaml --profile tools run --rm migrate npm run deploy:seed
```

The seed operation is idempotent. It adds or refreshes the three lesson offerings without creating users or prototype family data.

## 6. Start the website

```bash
docker compose --env-file .env.production -f compose.production.yaml up -d app cloudflared
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --tail=100 app cloudflared
```

Expected state:

- `postgres` is healthy.
- `app` becomes healthy after the database check succeeds.
- `cloudflared` is running and the Cloudflare dashboard reports a healthy tunnel.

Verify:

```bash
curl --fail --silent --show-error https://hainabian.org/api/health
curl --fail --head https://hainabian.org/en
curl --fail --head https://hainabian.org/zh
```

The health response should be `{"status":"ok"}`.

## 7. First production checks

Perform these in order:

1. Request an email OTP and confirm it arrives.
2. Sign in using `TEACHER_EMAIL` and confirm the admin page opens.
3. Register a separate parent test email.
4. Add a learner to that parent and create a test package.
5. Confirm the parent sees only that household's records.
6. Record and void a lesson and verify the credit is deducted and restored.
7. Test Google login using the same parent email used for OTP.
8. Test the Google booking embed and direct fallback link in both languages.
9. Test a genuine Ziina payment link without completing an unwanted payment.
10. Confirm `/en/privacy` and `/zh/privacy` show the correct contact email.

## Updating the deployment

Database migrations must run before the new application container replaces the old one:

```bash
cd /opt/hainabian
git pull --ff-only
docker compose --env-file .env.production -f compose.production.yaml build app migrate
docker compose --env-file .env.production -f compose.production.yaml --profile tools run --rm migrate npm run deploy:migrate
docker compose --env-file .env.production -f compose.production.yaml up -d app cloudflared
docker compose --env-file .env.production -f compose.production.yaml ps
```

Inspect logs after every update:

```bash
docker compose --env-file .env.production -f compose.production.yaml logs --tail=200 app
```

## Backups

Create a database backup:

```bash
cd /opt/hainabian
bash scripts/backup-production.sh
```

The script keeps 14 days of local dumps in `/opt/hainabian/backups`. Copy these files to encrypted off-server storage; a backup stored only on the VPS does not protect against VPS loss.

Example daily cron entry:

```cron
15 2 * * * cd /opt/hainabian && /usr/bin/bash scripts/backup-production.sh >> /var/log/hainabian-backup.log 2>&1
```

To inspect running services or stop the application:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --tail=200
docker compose --env-file .env.production -f compose.production.yaml down
```

Do not use `down --volumes`; that deletes the PostgreSQL volume.
