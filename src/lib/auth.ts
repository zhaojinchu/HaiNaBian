import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { ensureHouseholdForUser } from "@/lib/portal/households";

function runtimeValue(name: string, developmentFallback: string) {
  const configured = process.env[name]?.trim();
  if (configured) return configured;

  const productionBuild =
    process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !productionBuild) {
    throw new Error(`${name} is required in production.`);
  }
  return developmentFallback;
}

const authSecret = runtimeValue(
  "BETTER_AUTH_SECRET",
  "local-development-only-secret-change-before-sharing",
);
const authBaseUrl = runtimeValue(
  "BETTER_AUTH_URL",
  "http://localhost:3000",
);
const teacherEmail = runtimeValue("TEACHER_EMAIL", "teacher@localhost")
  .trim()
  .toLowerCase();
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.trim();
const smtpPort = Number(process.env.SMTP_PORT ?? 1025);
const productionSmtp = process.env.NODE_ENV === "production";
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: productionSmtp && smtpPort !== 465,
  tls: productionSmtp ? { minVersion: "TLSv1.2" } : undefined,
  ...(smtpUser && smtpPassword
    ? { auth: { user: smtpUser, pass: smtpPassword } }
    : {}),
});

export const auth = betterAuth({
  appName: "Hai Na Bian",
  baseURL: authBaseUrl,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    storage: "database",
    modelName: "rateLimit",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "parent",
        input: false,
      },
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      allowDifferentEmails: false,
      trustedProviders: ["google"],
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      storeOTP: "hashed",
      rateLimit: {
        window: 60,
        max: 3,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        await mailer.sendMail({
          from: process.env.EMAIL_FROM ?? "Hai Na Bian <lessons@localhost>",
          to: email,
          subject: "Your Hai Na Bian sign-in code",
          text: `Your sign-in code is ${otp}. It expires in 5 minutes.`,
          html: `<p>Your Hai Na Bian sign-in code is:</p><p style="font-size:24px;letter-spacing:0.2em"><strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`,
        });
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const email = newUser.email.trim().toLowerCase();
          return {
            data: {
              ...newUser,
              email,
              name: email,
              image: null,
              role: email === teacherEmail ? "teacher" : "parent",
            },
          };
        },
        after: async (newUser) => {
          const role = "role" in newUser ? newUser.role : "parent";
          if (role === "parent") {
            await ensureHouseholdForUser(newUser.id);
          }
        },
      },
    },
  },
});

export const authFeatures = {
  googleConfigured,
};

export type PortalSession = typeof auth.$Infer.Session;
