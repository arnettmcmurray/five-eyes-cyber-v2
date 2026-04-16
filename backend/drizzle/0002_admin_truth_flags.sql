ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "is_top_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "is_break_glass" boolean DEFAULT false NOT NULL;--> statement-breakpoint
