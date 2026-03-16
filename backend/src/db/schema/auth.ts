import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { learners } from './learners.js';

/** Registered auth credentials — one per learner handle. Password hash stored separately (not implemented). */
export const authUsers = pgTable('auth_users', {
  id:           text('id').primaryKey(),
  learnerId:    text('learner_id').notNull().references(() => learners.id, { onDelete: 'cascade' }).unique(),
  handle:       text('handle').notNull().unique(),
  /** bcrypt hash — null until password is set */
  passwordHash: text('password_hash'),
  otpEnabled:   boolean('otp_enabled').notNull().default(false),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

/** Short-lived OTP codes for login or password-reset flows. */
export const otpRequests = pgTable('otp_requests', {
  id:        text('id').primaryKey(),
  handle:    text('handle').notNull(),
  code:      text('code').notNull(),          // 6-digit string
  purpose:   text('purpose').notNull(),       // 'login' | 'reset'
  used:      boolean('used').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** Active learner sessions issued after OTP verification. */
export const learnerSessions = pgTable('learner_sessions', {
  id:        text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
