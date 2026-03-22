import { pgTable, text, integer, timestamp, real, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items';

export const quizCandidateStatusEnum = pgEnum('quiz_candidate_status', [
  'pending-review', 'approved', 'rejected', 'promoted'
]);

export const quizCandidates = pgTable('quiz_candidates', {
  id:                    text('id').primaryKey(),
  kbItemId:              text('kb_item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  revisionId:            text('revision_id').notNull(),
  questionText:          text('question_text').notNull(),
  options:               text('options').array().notNull(),
  suggestedCorrectIndex: integer('suggested_correct_index').notNull(),
  explanation:           text('explanation').notNull(),
  status:                quizCandidateStatusEnum('status').notNull().default('pending-review'),
  confidence:            real('confidence').notNull().default(0),
  reviewedBy:            text('reviewed_by'),
  reviewedAt:            timestamp('reviewed_at'),
  promotedToModuleId:    text('promoted_to_module_id'),
  createdAt:             timestamp('created_at').notNull().defaultNow(),
});
