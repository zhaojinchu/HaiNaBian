ALTER TABLE "payment_records" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "provider" SET DEFAULT 'bank_transfer'::text;--> statement-breakpoint
DROP TYPE "public"."payment_provider";--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('bank_transfer');--> statement-breakpoint
UPDATE "payment_records" SET "provider" = 'bank_transfer';--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "provider" SET DEFAULT 'bank_transfer'::"public"."payment_provider";--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "provider" SET DATA TYPE "public"."payment_provider" USING "provider"::"public"."payment_provider";--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "email_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "login_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_records" DROP COLUMN "payment_url";--> statement-breakpoint
UPDATE "user"
SET "role" = CASE
  WHEN lower("email") = 'leiqi19791120@gmail.com' THEN 'teacher'::"public"."user_role"
  ELSE 'parent'::"public"."user_role"
END,
"login_enabled" = lower("email") = 'leiqi19791120@gmail.com';--> statement-breakpoint
DELETE FROM "session"
WHERE "user_id" IN (
  SELECT "id" FROM "user"
  WHERE lower("email") <> 'leiqi19791120@gmail.com'
);
