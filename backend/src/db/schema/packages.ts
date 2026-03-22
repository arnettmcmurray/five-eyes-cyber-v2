import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { learningModules } from './modules';
import { groups } from './groups';

/**
 * A package: a named bundle of modules (e.g. "Cybersecurity Fundamentals", "HIPAA Compliance").
 * Packages can be assigned to groups (and through groups, to learners).
 */
export const packages = pgTable('packages', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  name:        text('name').notNull(),
  description: text('description').notNull().default(''),
  /** Price in cents (USD). Null = price not set / contact sales. 0 = free. */
  priceCents:  integer('price_cents'),
  /** Access tier label: 'free' | 'basic' | 'pro' | 'enterprise' or custom. */
  tier:        text('tier'),
  /** Whether this package is visible in the learner catalog. */
  public:      boolean('public').notNull().default(false),
  createdBy:   text('created_by').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

/** Which modules belong to a package, and in what order. */
export const packageModules = pgTable('package_modules', {
  id:          text('id').primaryKey(),
  packageId:   text('package_id').notNull().references(() => packages.id, { onDelete: 'cascade' }),
  moduleId:    text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  displayOrder: text('display_order').notNull().default('0'),
  addedAt:     timestamp('added_at').notNull().defaultNow(),
});

/** Which groups (and therefore learners) are assigned a package. */
export const packageGroupAssignments = pgTable('package_group_assignments', {
  id:          text('id').primaryKey(),
  packageId:   text('package_id').notNull().references(() => packages.id, { onDelete: 'cascade' }),
  groupId:     text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  assignedBy:  text('assigned_by').notNull(),
  assignedAt:  timestamp('assigned_at').notNull().defaultNow(),
});
