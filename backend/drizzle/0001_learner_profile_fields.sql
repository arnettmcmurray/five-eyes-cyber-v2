-- Migration 0001: Add profile fields to learners table
-- Nullable so existing rows are unaffected.
ALTER TABLE "learners" ADD COLUMN IF NOT EXISTS "raw_email" text;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN IF NOT EXISTS "full_name" text;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN IF NOT EXISTS "company" text;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN IF NOT EXISTS "role" text;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
