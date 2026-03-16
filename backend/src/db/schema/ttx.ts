import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Scenario structure
// ---------------------------------------------------------------------------

export const ttxScenarios = pgTable('ttx_scenarios', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  title:       text('title').notNull(),
  description: text('description').notNull().default(''),
  objective:   text('objective').notNull().default(''),
  createdBy:   text('created_by').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

export const ttxScenarioSections = pgTable('ttx_scenario_sections', {
  id:         text('id').primaryKey(),
  scenarioId: text('scenario_id').notNull().references(() => ttxScenarios.id, { onDelete: 'cascade' }),
  title:      text('title').notNull(),
  order:      integer('order').notNull().default(0),
});

export const ttxScenarioSteps = pgTable('ttx_scenario_steps', {
  id:                text('id').primaryKey(),
  sectionId:         text('section_id').notNull().references(() => ttxScenarioSections.id, { onDelete: 'cascade' }),
  prompt:            text('prompt').notNull(),
  facilitatorNotes:  text('facilitator_notes').notNull().default(''),
  order:             integer('order').notNull().default(0),
});

export const ttxInjects = pgTable('ttx_injects', {
  id:                    text('id').primaryKey(),
  stepId:                text('step_id').notNull().references(() => ttxScenarioSteps.id, { onDelete: 'cascade' }),
  body:                  text('body').notNull(),
  /** legal | media | technical | customer | other */
  injectType:            text('inject_type').notNull().default('other'),
  /** JSON array of role strings e.g. '["CEO","Legal"]' */
  targetRoles:           text('target_roles').notNull().default('[]'),
  suggestedTimingMinutes: integer('suggested_timing_minutes'),
  order:                 integer('order').notNull().default(0),
});

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const ttxSessions = pgTable('ttx_sessions', {
  id:            text('id').primaryKey(),
  scenarioId:    text('scenario_id').notNull().references(() => ttxScenarios.id),
  /** Snapshot of scenario title at session start (immutable after start). */
  title:         text('title').notNull(),
  scheduledAt:   timestamp('scheduled_at'),
  startedAt:     timestamp('started_at'),
  endedAt:       timestamp('ended_at'),
  /** planned | active | ended */
  status:        text('status').notNull().default('planned'),
  facilitatorId: text('facilitator_id').notNull(),  // admin_users.id
  /** Current inject id being run (facilitator advances this). */
  currentInjectId: text('current_inject_id').references(() => ttxInjects.id, { onDelete: 'set null' }),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

export const ttxSessionParticipants = pgTable('ttx_session_participants', {
  id:       text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => ttxSessions.id, { onDelete: 'cascade' }),
  /** Learner handle (from OTP login) or admin username. */
  handle:   text('handle').notNull(),
  /** Org role the participant is playing e.g. "CEO", "Legal Counsel". */
  role:     text('role').notNull().default(''),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Event log (inject_delivered | decision | note | action)
// ---------------------------------------------------------------------------

export const ttxSessionEvents = pgTable('ttx_session_events', {
  id:             text('id').primaryKey(),
  sessionId:      text('session_id').notNull().references(() => ttxSessions.id, { onDelete: 'cascade' }),
  /** inject_delivered | decision | note | action */
  eventType:      text('event_type').notNull(),
  actorHandle:    text('actor_handle').notNull(),
  body:           text('body').notNull(),
  linkedInjectId: text('linked_inject_id'),
  occurredAt:     timestamp('occurred_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// After-action review
// ---------------------------------------------------------------------------

export const ttxAfterActionReviews = pgTable('ttx_after_action_reviews', {
  id:           text('id').primaryKey(),
  sessionId:    text('session_id').notNull().unique().references(() => ttxSessions.id, { onDelete: 'cascade' }),
  summary:      text('summary').notNull().default(''),
  strengths:    text('strengths').notNull().default(''),
  improvements: text('improvements').notNull().default(''),
  /** draft | final */
  status:       text('status').notNull().default('draft'),
  createdBy:    text('created_by').notNull(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

export const ttxActionItems = pgTable('ttx_action_items', {
  id:       text('id').primaryKey(),
  aarId:    text('aar_id').notNull().references(() => ttxAfterActionReviews.id, { onDelete: 'cascade' }),
  body:     text('body').notNull(),
  owner:    text('owner').notNull().default(''),
  dueAt:    timestamp('due_at'),
  /** open | closed | retesting */
  status:   text('status').notNull().default('open'),
  closedAt: timestamp('closed_at'),
  evidence: text('evidence').notNull().default(''),
});
