import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const userRoleEnum = pgEnum("user_role", ["parent", "teacher"]);
export const lessonFormatEnum = pgEnum("lesson_format", [
  "individual",
  "pair",
  "group",
]);
export const packageStatusEnum = pgEnum("package_status", [
  "active",
  "exhausted",
  "void",
]);
export const creditReasonEnum = pgEnum("credit_reason", [
  "package_grant",
  "lesson_used",
  "lesson_voided",
  "adjustment",
]);
export const lessonStatusEnum = pgEnum("lesson_status", [
  "completed",
  "void",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "open",
  "paid",
  "overdue",
  "void",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "ziina_manual",
]);

// Better Auth schema. Property names intentionally match Better Auth's models.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoleEnum("role").default("parent").notNull(),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    unique("account_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  ...timestamps,
});

export const householdMembers = pgTable(
  "household_members",
  {
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.householdId, table.userId] }),
    unique("household_member_user_unique").on(table.userId),
  ],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [index("students_household_idx").on(table.householdId)],
);

export const lessonOfferings = pgTable("lesson_offerings", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  format: lessonFormatEnum("format").notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
});

export const packages = pgTable(
  "packages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => lessonOfferings.id),
    totalCredits: integer("total_credits").notNull(),
    status: packageStatusEnum("status").default("active").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    ...timestamps,
  },
  (table) => [
    check(
      "packages_supported_credit_count",
      sql`${table.totalCredits} in (1, 10)`,
    ),
    index("packages_student_idx").on(table.studentId),
  ],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    format: lessonFormatEnum("format").notNull(),
    status: lessonStatusEnum("status").default("completed").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    voidedBy: text("voided_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("lessons_occurred_at_idx").on(table.occurredAt)],
);

export const lessonParticipants = pgTable(
  "lesson_participants",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.lessonId, table.studentId] }),
    index("lesson_participants_student_idx").on(table.studentId),
  ],
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id),
    lessonId: uuid("lesson_id").references(() => lessons.id),
    delta: integer("delta").notNull(),
    reason: creditReasonEnum("reason").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("credit_ledger_nonzero_delta", sql`${table.delta} <> 0`),
    unique("credit_ledger_lesson_reason_unique").on(
      table.packageId,
      table.lessonId,
      table.reason,
    ),
    index("credit_ledger_package_idx").on(table.packageId),
  ],
);

export const paymentRecords = pgTable(
  "payment_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id),
    provider: paymentProviderEnum("provider")
      .default("ziina_manual")
      .notNull(),
    externalReference: text("external_reference").notNull(),
    paymentUrl: text("payment_url"),
    amountFils: integer("amount_fils").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: paymentStatusEnum("status").default("open").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    ...timestamps,
  },
  (table) => [
    check("payment_records_nonnegative_amount", sql`${table.amountFils} >= 0`),
    unique("payment_records_package_unique").on(table.packageId),
    index("payment_records_household_idx").on(table.householdId),
    index("payment_records_status_idx").on(table.status),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_log_actor_idx").on(table.actorId),
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
  ],
);
