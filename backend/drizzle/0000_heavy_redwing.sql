CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('open', 'acknowledged', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."kb_item_status" AS ENUM('draft', 'under-review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."kb_item_type" AS ENUM('training-content', 'threat-brief', 'policy', 'faq', 'glossary-term');--> statement-breakpoint
CREATE TYPE "public"."source_trust" AS ENUM('internal', 'external-curated', 'raw-upload');--> statement-breakpoint
CREATE TYPE "public"."raw_source_type" AS ENUM('manual-entry', 'file-upload', 'url-fetch');--> statement-breakpoint
CREATE TYPE "public"."ingestion_status" AS ENUM('pending', 'extracting', 'processing', 'review-ready', 'failed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lesson_role" AS ENUM('primary', 'supplementary', 'prerequisite-reading');--> statement-breakpoint
CREATE TYPE "public"."quiz_candidate_status" AS ENUM('pending-review', 'approved', 'rejected', 'promoted');--> statement-breakpoint
CREATE TYPE "public"."kb_status_transition" AS ENUM('draft', 'under-review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."workflow_action" AS ENUM('submit-for-review', 'approve', 'reject', 'request-changes', 'publish', 'unpublish', 'archive');--> statement-breakpoint
CREATE TYPE "public"."ingest_mode" AS ENUM('manual', 'scheduled', 'monitor_only');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('active', 'inactive', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('government', 'regulator', 'insurer', 'industry_association', 'vendor', 'internal_curated', 'news', 'blog', 'partner', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."review_priority" AS ENUM('low', 'normal', 'high', 'blocking');--> statement-breakpoint
CREATE TYPE "public"."review_queue_status" AS ENUM('pending', 'in_review', 'approved', 'rejected', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."publish_decision" AS ENUM('approved', 'rejected', 'deferred');--> statement-breakpoint
CREATE TABLE "access_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"tier" text NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"granted_by" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_overrides_learner_id_unique" UNIQUE("learner_id")
);
--> statement-breakpoint
CREATE TABLE "assessment_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"access_token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"answers" text,
	"follow_up_enabled" boolean DEFAULT true NOT NULL,
	"last_follow_up_at" timestamp,
	"completed_at" timestamp,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_leads_email_unique" UNIQUE("email"),
	CONSTRAINT "assessment_leads_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"handle" text NOT NULL,
	"password_hash" text,
	"otp_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_learner_id_unique" UNIQUE("learner_id"),
	CONSTRAINT "auth_users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "learner_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learner_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "otp_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"code" text NOT NULL,
	"purpose" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"content_item_id" text NOT NULL,
	"source_id" text,
	"alert_type" text NOT NULL,
	"severity" "alert_severity" DEFAULT 'warning' NOT NULL,
	"status" "alert_status" DEFAULT 'open' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"link_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_blocks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer NOT NULL,
	"embedding" vector(1536),
	"embedded_at" timestamp,
	"embedding_model" text
);
--> statement-breakpoint
CREATE TABLE "freshness_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"applies_to_type" text NOT NULL,
	"applies_to_value" text NOT NULL,
	"review_after_days" integer NOT NULL,
	"expire_after_days" integer NOT NULL,
	"alert_before_days" integer DEFAULT 30 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "governance_ingest_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"job_type" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"items_seen" integer DEFAULT 0 NOT NULL,
	"items_created" integer DEFAULT 0 NOT NULL,
	"items_updated" integer DEFAULT 0 NOT NULL,
	"items_flagged" integer DEFAULT 0 NOT NULL,
	"error_text" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"learner_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kb_items" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"type" "kb_item_type" NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" "kb_item_status" DEFAULT 'draft' NOT NULL,
	"source_trust" "source_trust" NOT NULL,
	"created_by" text NOT NULL,
	"current_revision_id" text,
	"search_vector" text,
	"freshness_cycle" text,
	"published_at" timestamp,
	"last_reviewed_at" timestamp,
	"source_id" text,
	"source_url" text,
	"source_trust_level_id" text,
	"review_status" text,
	"freshness_status" text,
	"next_review_at" timestamp,
	"learner_visible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kb_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "learning_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"next_module_id" text,
	"estimated_minutes" integer,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learning_modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "module_prerequisites" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"prerequisite_module_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kb_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"content" text NOT NULL,
	"version" integer NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "raw_source_type" NOT NULL,
	"label" text NOT NULL,
	"origin" text NOT NULL,
	"raw_content" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"ingestion_job_id" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"status" "ingestion_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"result_item_id" text,
	"created_by" text NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"parent_topic_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lesson_content_links" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"kb_item_id" text NOT NULL,
	"role" "lesson_role" DEFAULT 'primary' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"added_by" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"kb_item_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"question_text" text NOT NULL,
	"options" text[] NOT NULL,
	"suggested_correct_index" integer NOT NULL,
	"explanation" text NOT NULL,
	"status" "quiz_candidate_status" DEFAULT 'pending-review' NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"promoted_to_module_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"assigned_to" text,
	"due_at" timestamp,
	"priority" text DEFAULT 'normal' NOT NULL,
	"note" text,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_events" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"action" "workflow_action" NOT NULL,
	"performed_by" text NOT NULL,
	"note" text,
	"from_status" "kb_status_transition" NOT NULL,
	"to_status" "kb_status_transition" NOT NULL,
	"performed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"module_id" text NOT NULL,
	"status" text DEFAULT 'started' NOT NULL,
	"score" integer,
	"total" integer,
	"percentage" integer,
	"last_attempt_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learners" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learners_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "practice_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"module_id" text NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"percentage" integer NOT NULL,
	"passed" boolean NOT NULL,
	"results" jsonb NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"learner_id" text,
	"group_id" text,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "package_group_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"group_id" text NOT NULL,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"module_id" text NOT NULL,
	"display_order" text DEFAULT '0' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_cents" integer,
	"tier" text,
	"public" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ttx_action_items" (
	"id" text PRIMARY KEY NOT NULL,
	"aar_id" text NOT NULL,
	"body" text NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"due_at" timestamp,
	"status" text DEFAULT 'open' NOT NULL,
	"closed_at" timestamp,
	"evidence" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_after_action_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"strengths" text DEFAULT '' NOT NULL,
	"improvements" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ttx_after_action_reviews_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "ttx_injects" (
	"id" text PRIMARY KEY NOT NULL,
	"step_id" text NOT NULL,
	"body" text NOT NULL,
	"inject_type" text DEFAULT 'other' NOT NULL,
	"target_roles" text DEFAULT '[]' NOT NULL,
	"suggested_timing_minutes" integer,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_scenario_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"scenario_id" text NOT NULL,
	"title" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_scenario_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"prompt" text NOT NULL,
	"facilitator_notes" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_scenarios" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"objective" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ttx_scenarios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ttx_session_events" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"actor_handle" text NOT NULL,
	"body" text NOT NULL,
	"linked_inject_id" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_session_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"handle" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ttx_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"scenario_id" text NOT NULL,
	"title" text NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"ended_at" timestamp,
	"status" text DEFAULT 'planned' NOT NULL,
	"facilitator_id" text NOT NULL,
	"current_inject_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_trust_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"rank" integer NOT NULL,
	"learner_auto_publish_allowed" boolean DEFAULT false NOT NULL,
	"review_required" boolean DEFAULT true NOT NULL,
	"freshness_default_days" integer DEFAULT 365 NOT NULL,
	CONSTRAINT "source_trust_levels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"source_type" "source_type" DEFAULT 'unknown' NOT NULL,
	"domain" text NOT NULL,
	"base_url" text,
	"trust_level_id" text NOT NULL,
	"status" "source_status" DEFAULT 'active' NOT NULL,
	"ingest_mode" "ingest_mode" DEFAULT 'manual' NOT NULL,
	"owner_user_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"source_id" text,
	"allow_subdomains" boolean DEFAULT true NOT NULL,
	"trust_level_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "source_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "review_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"content_item_id" text NOT NULL,
	"source_id" text,
	"reason_code" text NOT NULL,
	"priority" "review_priority" DEFAULT 'normal' NOT NULL,
	"status" "review_queue_status" DEFAULT 'pending' NOT NULL,
	"assigned_to_user_id" text,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolution_notes" text
);
--> statement-breakpoint
CREATE TABLE "publish_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"content_item_id" text NOT NULL,
	"decision" "publish_decision" NOT NULL,
	"reason_code" text,
	"notes" text,
	"decided_by_user_id" text NOT NULL,
	"decided_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_sessions" ADD CONSTRAINT "learner_sessions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_alerts" ADD CONSTRAINT "content_alerts_content_item_id_kb_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_alerts" ADD CONSTRAINT "content_alerts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_chunks" ADD CONSTRAINT "content_chunks_item_id_kb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_chunks" ADD CONSTRAINT "content_chunks_revision_id_kb_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."kb_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_ingest_jobs" ADD CONSTRAINT "governance_ingest_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_prerequisite_module_id_learning_modules_id_fk" FOREIGN KEY ("prerequisite_module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_revisions" ADD CONSTRAINT "kb_revisions_item_id_kb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_source_id_raw_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."raw_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relationships" ADD CONSTRAINT "topic_relationships_item_id_kb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relationships" ADD CONSTRAINT "topic_relationships_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_content_links" ADD CONSTRAINT "lesson_content_links_kb_item_id_kb_items_id_fk" FOREIGN KEY ("kb_item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_candidates" ADD CONSTRAINT "quiz_candidates_kb_item_id_kb_items_id_fk" FOREIGN KEY ("kb_item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_item_id_kb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_item_id_kb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_progress" ADD CONSTRAINT "learner_progress_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_assignments" ADD CONSTRAINT "module_assignments_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_group_assignments" ADD CONSTRAINT "package_group_assignments_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_group_assignments" ADD CONSTRAINT "package_group_assignments_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_modules" ADD CONSTRAINT "package_modules_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_modules" ADD CONSTRAINT "package_modules_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_action_items" ADD CONSTRAINT "ttx_action_items_aar_id_ttx_after_action_reviews_id_fk" FOREIGN KEY ("aar_id") REFERENCES "public"."ttx_after_action_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_after_action_reviews" ADD CONSTRAINT "ttx_after_action_reviews_session_id_ttx_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ttx_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_injects" ADD CONSTRAINT "ttx_injects_step_id_ttx_scenario_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."ttx_scenario_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_scenario_sections" ADD CONSTRAINT "ttx_scenario_sections_scenario_id_ttx_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."ttx_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_scenario_steps" ADD CONSTRAINT "ttx_scenario_steps_section_id_ttx_scenario_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."ttx_scenario_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_session_events" ADD CONSTRAINT "ttx_session_events_session_id_ttx_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ttx_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_session_participants" ADD CONSTRAINT "ttx_session_participants_session_id_ttx_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ttx_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_sessions" ADD CONSTRAINT "ttx_sessions_scenario_id_ttx_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."ttx_scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ttx_sessions" ADD CONSTRAINT "ttx_sessions_current_inject_id_ttx_injects_id_fk" FOREIGN KEY ("current_inject_id") REFERENCES "public"."ttx_injects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_trust_level_id_source_trust_levels_id_fk" FOREIGN KEY ("trust_level_id") REFERENCES "public"."source_trust_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_domains" ADD CONSTRAINT "source_domains_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_domains" ADD CONSTRAINT "source_domains_trust_level_id_source_trust_levels_id_fk" FOREIGN KEY ("trust_level_id") REFERENCES "public"."source_trust_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_content_item_id_kb_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_decisions" ADD CONSTRAINT "publish_decisions_content_item_id_kb_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."kb_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "learner_progress_learner_module_uniq" ON "learner_progress" USING btree ("learner_id","module_id");