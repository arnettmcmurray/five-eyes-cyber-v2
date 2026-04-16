import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** Admin users — strictly separated from learner auth. */
export const adminUsers = pgTable('admin_users', {
  id:           text('id').primaryKey(),
  username:     text('username').notNull().unique(),
  /** scrypt hash stored as salt:hash (hex). */
  passwordHash: text('password_hash').notNull(),
  isTopAdmin:   boolean('is_top_admin').notNull().default(false),
  isBreakGlass: boolean('is_break_glass').notNull().default(false),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

/** Active admin sessions. */
export const adminSessions = pgTable('admin_sessions', {
  id:        text('id').primaryKey(),
  adminId:   text('admin_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
