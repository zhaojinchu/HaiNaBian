CREATE TYPE "public"."credit_reason" AS ENUM('package_grant', 'lesson_used', 'lesson_voided', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."lesson_format" AS ENUM('individual', 'pair', 'group');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('completed', 'void');--> statement-breakpoint
CREATE TYPE "public"."package_status" AS ENUM('active', 'exhausted', 'void');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('ziina_manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('open', 'paid', 'overdue', 'void');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('parent', 'teacher');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"lesson_id" uuid,
	"delta" integer NOT NULL,
	"reason" "credit_reason" NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_ledger_lesson_reason_unique" UNIQUE("package_id","lesson_id","reason"),
	CONSTRAINT "credit_ledger_nonzero_delta" CHECK ("credit_ledger"."delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"household_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "household_members_household_id_user_id_pk" PRIMARY KEY("household_id","user_id"),
	CONSTRAINT "household_member_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"format" "lesson_format" NOT NULL,
	"name_en" text NOT NULL,
	"name_zh" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_offerings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "lesson_participants" (
	"lesson_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_participants_lesson_id_student_id_pk" PRIMARY KEY("lesson_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"format" "lesson_format" NOT NULL,
	"status" "lesson_status" DEFAULT 'completed' NOT NULL,
	"created_by" text NOT NULL,
	"voided_at" timestamp with time zone,
	"voided_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"total_credits" integer NOT NULL,
	"status" "package_status" DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_supported_credit_count" CHECK ("packages"."total_credits" in (1, 10))
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"provider" "payment_provider" DEFAULT 'ziina_manual' NOT NULL,
	"external_reference" text NOT NULL,
	"payment_url" text,
	"amount_fils" integer NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"status" "payment_status" DEFAULT 'open' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_records_package_unique" UNIQUE("package_id"),
	CONSTRAINT "payment_records_nonnegative_amount" CHECK ("payment_records"."amount_fils" >= 0)
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'parent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_participants" ADD CONSTRAINT "lesson_participants_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_participants" ADD CONSTRAINT "lesson_participants_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_participants" ADD CONSTRAINT "lesson_participants_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_voided_by_user_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_offering_id_lesson_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."lesson_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_package_idx" ON "credit_ledger" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "lesson_participants_student_idx" ON "lesson_participants" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "lessons_occurred_at_idx" ON "lessons" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "packages_student_idx" ON "packages" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "payment_records_household_idx" ON "payment_records" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "payment_records_status_idx" ON "payment_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "students_household_idx" ON "students" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_single_package_grant" ON "credit_ledger" ("package_id") WHERE "reason" = 'package_grant';--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_credit_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'credit ledger entries are immutable';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "credit_ledger_immutable"
BEFORE UPDATE OR DELETE ON "credit_ledger"
FOR EACH ROW EXECUTE FUNCTION prevent_credit_ledger_mutation();--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_nonnegative_credit_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT COALESCE(SUM("delta"), 0)
  INTO current_balance
  FROM "credit_ledger"
  WHERE "package_id" = NEW."package_id";

  IF current_balance + NEW."delta" < 0 THEN
    RAISE EXCEPTION 'credit balance cannot become negative';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "credit_ledger_nonnegative"
BEFORE INSERT ON "credit_ledger"
FOR EACH ROW EXECUTE FUNCTION enforce_nonnegative_credit_balance();
