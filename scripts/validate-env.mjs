const required = [
  "NODE_ENV",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TEACHER_EMAIL",
  "GOOGLE_BOOKING_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
  "NEXT_PUBLIC_SITE_URL",
  "PRIVACY_CONTACT_EMAIL",
  "CLOUDFLARE_TUNNEL_TOKEN",
];

const errors = [];

for (const name of required) {
  const value = process.env[name]?.trim();
  if (!value) errors.push(`${name} is required`);
  if (value && /replace|change-me|example\.com|your_/i.test(value)) {
    errors.push(`${name} still contains a placeholder value`);
  }
}

if (
  process.env.BETTER_AUTH_SECRET &&
  process.env.BETTER_AUTH_SECRET.length < 32
) {
  errors.push("BETTER_AUTH_SECRET must contain at least 32 characters");
}

if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
  errors.push("NODE_ENV must be production");
}

if (
  process.env.POSTGRES_PASSWORD &&
  process.env.POSTGRES_PASSWORD.length < 32
) {
  errors.push("POSTGRES_PASSWORD must contain at least 32 characters");
}

if (
  process.env.CLOUDFLARE_TUNNEL_TOKEN &&
  process.env.CLOUDFLARE_TUNNEL_TOKEN.length < 50
) {
  errors.push("CLOUDFLARE_TUNNEL_TOKEN does not look complete");
}

for (const name of ["BETTER_AUTH_URL", "NEXT_PUBLIC_SITE_URL"]) {
  if (!process.env[name]) continue;
  try {
    const url = new URL(process.env[name] ?? "");
    if (url.protocol !== "https:") errors.push(`${name} must use HTTPS`);
    if (url.pathname !== "/" || url.search || url.hash) {
      errors.push(`${name} must be an origin without a path, query, or hash`);
    }
  } catch {
    errors.push(`${name} must be a valid URL`);
  }
}

if (process.env.DATABASE_URL) {
  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
      errors.push("DATABASE_URL must use PostgreSQL");
    }
  } catch {
    errors.push("DATABASE_URL must be a valid PostgreSQL URL");
  }
}

if (process.env.GOOGLE_BOOKING_URL) {
  try {
    const bookingUrl = new URL(process.env.GOOGLE_BOOKING_URL);
    if (
      bookingUrl.protocol !== "https:" ||
      !["calendar.google.com", "calendar.app.google"].includes(
        bookingUrl.hostname,
      )
    ) {
      errors.push("GOOGLE_BOOKING_URL must be a Google Calendar HTTPS URL");
    }
  } catch {
    errors.push("GOOGLE_BOOKING_URL must be a valid URL");
  }
}

for (const name of ["TEACHER_EMAIL", "PRIVACY_CONTACT_EMAIL"]) {
  if (
    process.env[name] &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env[name])
  ) {
    errors.push(`${name} must be a valid email address`);
  }
}

const smtpPort = Number(process.env.SMTP_PORT);
if (process.env.SMTP_PORT && ![465, 587, 2465, 2587].includes(smtpPort)) {
  errors.push("SMTP_PORT must use an encrypted SMTP port");
}

if (
  process.env.EMAIL_FROM &&
  !/<[^\s@]+@[^\s@]+\.[^\s@]+>$/.test(process.env.EMAIL_FROM)
) {
  errors.push("EMAIL_FROM must use the format Name <email@example.com>");
}

if (
  process.env.BETTER_AUTH_URL &&
  process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.BETTER_AUTH_URL !== process.env.NEXT_PUBLIC_SITE_URL
) {
  errors.push("BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL must match");
}

if (errors.length) {
  console.error("Production environment validation failed:");
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production environment is valid.");
