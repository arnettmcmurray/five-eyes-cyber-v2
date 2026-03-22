import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Scenario structure (The Template)
// ---------------------------------------------------------------------------

export const ttxScenarios = pgTable('ttx_scenarios', {
  id:               text('id').primaryKey(), // UUID
  slug:             text('slug').notNull().unique(),
  title:            text('title').notNull(),
  executiveSummary: text('executive_summary').notNull().default(''),
  description:      text('description').notNull().default(''),
  objective:        text('objective').notNull().default(''),
  /** JSONB list of goals e.g. ["Test cross-functional notification", ...] */
  goals:            jsonb('goals').notNull().default([]),
  /** JSONB list of role IDs/titles e.g. ["CEO", "Legal"] */
  targetAudience:   jsonb('target_audience').notNull().default([]),
  signatureTheme:   text('signature_theme').notNull().default(''),
  createdBy:        text('created_by').notNull(),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
});

export const ttxScenarioSections = pgTable('ttx_scenario_sections', {
  id:         text('id').primaryKey(),
  scenarioId: text('scenario_id').notNull().references(() => ttxScenarios.id, { onDelete: 'cascade' }),
  title:      text('title').notNull(),
  background: text('background').notNull().default(''),
  order:      integer('order').notNull().default(0),
});

export const ttxScenarioSteps = pgTable('ttx_scenario_steps', {
  id:                       text('id').primaryKey(),
  sectionId:                text('section_id').notNull().references(() => ttxScenarioSections.id, { onDelete: 'cascade' }),
  title:                    text('title').notNull().default(''),
  /** Facilitator-only read-aloud narrative. */
  facilitatorNarrative:     text('facilitator_narrative').notNull().default(''),
  /** Public narrative feed for participants in the Situation Room. */
  participantSituationRoom: text('participant_situation_room').notNull().default(''),
  /** JSONB list of discussion questions. */
  prompts:                  jsonb('prompts').notNull().default([]),
  /** Guidance for the facilitator on what a good response looks like. */
  whatGoodLooksLike:        text('what_good_looks_like').notNull().default(''),
  /** Instruction for branching or pacing. */
  consequenceNote:          text('consequence_note').notNull().default(''),
  order:                    integer('order').notNull().default(0),
});

export const ttxInjects = pgTable('ttx_injects', {
  id:                    text('id').primaryKey(),
  /** Link to scenario for global injects or specifically to a step. */
  scenarioId:            text('scenario_id').notNull().references(() => ttxScenarios.id, { onDelete: 'cascade' }),
  stepId:                text('step_id').references(() => ttxScenarioSteps.id, { onDelete: 'cascade' }),
  content:               text('content').notNull(),
  /** technical | media | legal | regulatory | other */
  injectType:            text('inject_type').notNull().default('other'),
  /** JSONB array of role titles e.g. ["CEO", "Legal"] */
  targetRoles:           jsonb('target_roles').notNull().default([]),
  /** Guidance for facilitator on how this inject changes the landscape. */
  consequenceLogic:      text('consequence_logic').notNull().default(''),
  order:                 integer('order').notNull().default(0),
});

// ---------------------------------------------------------------------------
// Runs (The Instance)
// ---------------------------------------------------------------------------

export const ttxExerciseRuns = pgTable('ttx_exercise_runs', {
  id:            text('id').primaryKey(),
  scenarioId:    text('scenario_id').notNull().references(() => ttxScenarios.id),
  /** Human-readable session title set by facilitator at creation. */
  title:         text('title').notNull().default(''),
  /** Immutable snapshot of scenario data (title, steps, injects) at session start. */
  snapshot:      jsonb('snapshot').notNull().default({}),
  scheduledAt:   timestamp('scheduled_at'),
  startedAt:     timestamp('started_at'),
  endedAt:       timestamp('ended_at'),
  /** planned | active | hotwash | complete */
  status:        text('status').notNull().default('planned'),
  facilitatorId: text('facilitator_id').notNull(),
  /** Current step or inject ID being run. */
  currentStepId: text('current_step_id'),
  /** JSONB capture of aggregate decisions/notes per step. */
  decisions:     jsonb('decisions').notNull().default({}),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

export const ttxRunParticipants = pgTable('ttx_run_participants', {
  id:       text('id').primaryKey(),
  runId:    text('run_id').notNull().references(() => ttxExerciseRuns.id, { onDelete: 'cascade' }),
  handle:   text('handle').notNull(),
  /** Org role the participant is playing in this run. */
  role:     text('role').notNull().default(''),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

/** Recording specific learner inputs during a run. */
export const ttxParticipantResponses = pgTable('ttx_participant_responses', {
  id:            text('id').primaryKey(),
  runId:         text('run_id').notNull().references(() => ttxExerciseRuns.id, { onDelete: 'cascade' }),
  participantId: text('participant_id').notNull().references(() => ttxRunParticipants.id, { onDelete: 'cascade' }),
  stepId:        text('step_id').notNull().references(() => ttxScenarioSteps.id, { onDelete: 'cascade' }),
  content:       text('content').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Event log (narrative_delivered | inject_delivered | decision | note | action)
// ---------------------------------------------------------------------------

export const ttxRunEvents = pgTable('ttx_run_events', {
  id:             text('id').primaryKey(),
  runId:          text('run_id').notNull().references(() => ttxExerciseRuns.id, { onDelete: 'cascade' }),
  /** narrative_delivered | inject_delivered | decision | note | action */
  eventType:      text('event_type').notNull(),
  actorHandle:    text('actor_handle').notNull(),
  body:           text('body').notNull(),
  linkedInjectId: text('linked_inject_id'),
  occurredAt:     timestamp('occurred_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Action Catalog (AAR Output)
// ---------------------------------------------------------------------------

export const ttxActionItems = pgTable('ttx_action_items', {
  id:       text('id').primaryKey(),
  runId:    text('run_id').notNull().references(() => ttxExerciseRuns.id, { onDelete: 'cascade' }),
  title:    text('title').notNull().default(''),
  body:     text('body').notNull(),
  owner:    text('owner').notNull().default(''),
  dueAt:    timestamp('due_at'),
  /** open | in_progress | complete | retested */
  status:   text('status').notNull().default('open'),
  closedAt: timestamp('closed_at'),
  evidence: text('evidence').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

