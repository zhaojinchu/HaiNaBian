import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { ensureHouseholdForUser } from "@/lib/portal/households";

const teacherEmail = process.env.TEACHER_EMAIL?.trim().toLowerCase();
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.trim();
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  ...(smtpUser && smtpPassword
    ? { auth: { user: smtpUser, pass: smtpPassword } }
    : {}),
});

export const auth = betterAuth({
  appName: "Hai Na Bian",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "local-development-secret-change-before-sharing",
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
