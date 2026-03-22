import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { learners } from './learners';
import { packages } from './packages';

/**
 * Access tier rules (Task 23 contract):
 *
 *   free  — landing page + email assessment funnel only
 *   paid  — learning, KB, chat (governed by package assignments)
 *
 * The access tier for a learner is derived from their package assignments:
 *   - If any assigned package has tier != 'free' (or priceCents > 0), learner is 'paid'
 *   - Otherwise, learner is 'free' (open catalog mode)
 *
 * This table records explicit overrides (e.g. gifted access, trials, overrides).
 */
export const accessOverrides = pgTable('access_overrides', {
  id:         text('id').primaryKey(),
  learnerId:  text('learner_id').notNull().references(() => learners.id, { onDelete: 'cascade' }).unique(),
  /** 'free' | 'paid' */
  tier:       text('tier').notNull(),
  reason:     text('reason').notNull().default(''),
  grantedBy:  text('granted_by').notNull(),
  /** Null = permanent until revoked. */
  expiresAt:  timestamp('expires_at'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
});

/**
 * Email assessment funnel (Task 24 contract):
 *
 * One-time pre-registration flow. Captures an email + initial assessment
 * before the learner creates a full account. Supports follow-up/reminders.
 *
 * Flow: submit email → receive assessment link → complete assessment → follow-up
 */
export const assessmentLeads = pgTable('assessment_leads', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull().unique(),
  /** Token sent to the learner's email to access the assessment. */
  accessToken:  text('access_token').notNull().unique(),
  /** null = not started, 'started', 'completed' */
  status:       text('status').notNull().default('pending'),
  /** jsonb-serialized assessment answers (stored as text). */
  answers:      text('answers'),
  /** Whether follow-up emails are enabled. */
  followUpEnabled: boolean('follow_up_enabled').notNull().default(true),
  lastFollowUpAt:  timestamp('last_follow_up_at'),
  completedAt:     timestamp('completed_at'),
  /** Assessment link expires after 72h. Null = no expiry (legacy rows). */
  tokenExpiresAt:  timestamp('token_expires_at'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
});
