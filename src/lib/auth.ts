import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { isTeacherEmail, normalizeEmail } from "@/lib/auth-policy";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { sendSignInOtp } from "@/lib/email";

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
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

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
      loginEnabled: {
        type: "boolean",
        required: true,
        defaultValue: false,
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
      requireLocalEmailVerified: false,
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          disableSignUp: true,
        },
      }
    : {},
  plugins: [
    emailOTP({
      disableSignUp: true,
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
        await sendSignInOtp(email, otp);
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const email = normalizeEmail(newUser.email);
          if (!isTeacherEmail(email)) {
            throw new APIError("FORBIDDEN", {
              message:
                "This email does not have an account. Ask the teacher to create one first.",
            });
          }
          return {
            data: {
              ...newUser,
              email,
              name: email,
              image: null,
              role: "teacher",
              loginEnabled: true,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (newSession) => {
          const [portalUser] = await db
            .select({
              email: schema.user.email,
              role: schema.user.role,
              loginEnabled: schema.user.loginEnabled,
            })
            .from(schema.user)
            .where(eq(schema.user.id, newSession.userId))
            .limit(1);

          const validTeacher =
            portalUser?.role !== "teacher" ||
            isTeacherEmail(portalUser.email);
          if (!portalUser?.loginEnabled || !validTeacher) {
            throw new APIError("FORBIDDEN", {
              message:
                "This email does not have an active account. Ask the teacher to create one first.",
            });
          }
          return { data: newSession };
        },
      },
    },
  },
});

export const authFeatures = {
  googleConfigured,
};

export type PortalSession = typeof auth.$Infer.Session;
