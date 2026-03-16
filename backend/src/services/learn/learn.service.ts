import { eq, inArray, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { learningModules, modulePrerequisites } from '../../db/schema/modules.js';
import { practiceAttempts } from '../../db/schema/practice-attempts.js';
import { LearnProgressService } from './progress.service.js';

const progressSvc = new LearnProgressService();
import { lessonContentLinks } from '../../db/schema/lesson-links.js';
import { kbItems } from '../../db/schema/kb-items.js';
import { kbRevisions } from '../../db/schema/kb-revisions.js';
import { quizCandidates } from '../../db/schema/quiz-candidates.js';
import { topics, topicRelationships } from '../../db/schema/topics.js';

const REFERENCE_TYPES = new Set(['faq', 'glossary-term', 'policy', 'threat-brief']);
const STUDY_ROLES = new Set(['primary', 'prerequisite-reading']);
const EXCERPT_CHARS = 300;

export interface LearnTopicRef { slug: string; name: string }

export interface LearnStudyItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  role: string;
  content: string;
  topics: LearnTopicRef[];
}

export interface LearnReference {
  id: string;
  slug: string;
  title: string;
  type: string;
  excerpt: string;
  topics: LearnTopicRef[];
}

export interface LearnPracticeQuestion {
  id: string;
  questionText: string;
  options: string[];
  // correct answer NOT included
}

export interface LearnModuleResponse {
  module: { id: string; slug: string; title: string; description: string; nextModuleId: string | null };
  studyItems: LearnStudyItem[];
  references: LearnReference[];
  practiceQuestions: LearnPracticeQuestion[];
}

export interface PracticeAnswer { questionId: string; selectedIndex: number }

export interface PracticeResultItem {
  questionId: string;
  questionText: string;
  options: string[];
  correct: boolean;
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
}

export interface RemediationItem {
  title: string;
  excerpt: string;
  topics: LearnTopicRef[];
}

export interface PracticeResult {
  score: number;
  total: number;
  percentage: number;
  results: PracticeResultItem[];
  recommendedTopics: LearnTopicRef[];
  remediationItems: RemediationItem[];
}

export class LearnService {
  async getModuleStudy(moduleId: string, learnerId?: string): Promise<LearnModuleResponse> {
    const [mod] = await db.select().from(learningModules).where(eq(learningModules.id, moduleId)).limit(1);
    if (!mod) throw new Error(`Module not found: ${moduleId}`);
    if (!mod.published) throw new Error(`Module not available`);

    // Enforce prerequisites if a learner identity is known
    if (learnerId) {
      const prereqs = await db
        .select()
        .from(modulePrerequisites)
        .where(eq(modulePrerequisites.moduleId, moduleId));
      if (prereqs.length > 0) {
        const completed = await progressSvc.getCompletedSet(learnerId);
        const unmet = prereqs.filter(p => !completed.has(p.prerequisiteModuleId));
        if (unmet.length > 0) throw new Error(`Prerequisites not completed`);
      }
    }

    const links = await db
      .select()
      .from(lessonContentLinks)
      .where(eq(lessonContentLinks.moduleId, moduleId));

    if (links.length === 0) {
      return {
        module: { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description, nextModuleId: mod.nextModuleId ?? null },
        studyItems: [],
        references: [],
        practiceQuestions: [],
      };
    }

    const allItemIds = links.map(l => l.kbItemId);

    // Only published items reach learners
    const publishedItems = await db
      .select()
      .from(kbItems)
      .where(and(inArray(kbItems.id, allItemIds), eq(kbItems.status, 'published')));

    const publishedIds = new Set(publishedItems.map(i => i.id));
    const publishedLinks = links.filter(l => publishedIds.has(l.kbItemId));

    if (publishedLinks.length === 0) {
      return {
        module: { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description, nextModuleId: mod.nextModuleId ?? null },
        studyItems: [],
        references: [],
        practiceQuestions: [],
      };
    }

    const itemMap = new Map(publishedItems.map(i => [i.id, i]));

    // Fetch current revisions for published items that have one
    const revisionIds = publishedItems.map(i => i.currentRevisionId).filter((id): id is string => id !== null);
    const revisions = revisionIds.length > 0
      ? await db.select().from(kbRevisions).where(inArray(kbRevisions.id, revisionIds))
      : [];
    const revMap = new Map(revisions.map(r => [r.id, r]));

    // Fetch approved quiz candidates for all published items
    const qcs = await db
      .select()
      .from(quizCandidates)
      .where(and(
        inArray(quizCandidates.kbItemId, [...publishedIds]),
        eq(quizCandidates.status, 'approved'),
      ));

    // Fetch topic relationships and resolve names
    const topicRels = await db
      .select()
      .from(topicRelationships)
      .where(inArray(topicRelationships.itemId, [...publishedIds]));

    const topicIds = [...new Set(topicRels.map(r => r.topicId))];
    const topicRows = topicIds.length > 0
      ? await db.select().from(topics).where(inArray(topics.id, topicIds))
      : [];
    const topicMap = new Map(topicRows.map(t => [t.id, { slug: t.slug, name: t.name }]));

    function topicsForItem(itemId: string): LearnTopicRef[] {
      return topicRels
        .filter(r => r.itemId === itemId)
        .map(r => topicMap.get(r.topicId))
        .filter((t): t is LearnTopicRef => t !== undefined);
    }

    const ROLE_SORT: Record<string, number> = { 'prerequisite-reading': 0, primary: 1, supplementary: 2 };

    const sortedLinks = [...publishedLinks].sort(
      (a, b) => (ROLE_SORT[a.role] ?? 9) - (ROLE_SORT[b.role] ?? 9) || a.order - b.order,
    );

    const studyItems: LearnStudyItem[] = [];
    const references: LearnReference[] = [];

    for (const link of sortedLinks) {
      const item = itemMap.get(link.kbItemId);
      if (!item) continue;
      const rev = item.currentRevisionId ? revMap.get(item.currentRevisionId) : undefined;
      const content = rev?.content ?? '';
      const itemTopics = topicsForItem(item.id);
      const isReference = !STUDY_ROLES.has(link.role) || REFERENCE_TYPES.has(item.type);

      if (isReference) {
        references.push({
          id: item.id,
          slug: item.slug,
          title: item.title,
          type: item.type,
          excerpt: content.slice(0, EXCERPT_CHARS) + (content.length > EXCERPT_CHARS ? '…' : ''),
          topics: itemTopics,
        });
      } else {
        studyItems.push({
          id: item.id,
          slug: item.slug,
          title: item.title,
          type: item.type,
          role: link.role,
          content,
          topics: itemTopics,
        });
      }
    }

    // Practice questions: no correct index exposed
    const practiceQuestions: LearnPracticeQuestion[] = qcs.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
    }));

    return {
      module: { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description, nextModuleId: mod.nextModuleId ?? null },
      studyItems,
      references,
      practiceQuestions,
    };
  }

  async checkPractice(moduleId: string, answers: PracticeAnswer[], learnerId?: string): Promise<PracticeResult> {
    if (answers.length === 0) {
      return { score: 0, total: 0, percentage: 0, results: [], recommendedTopics: [], remediationItems: [] };
    }

    const questionIds = answers.map(a => a.questionId);
    const qcRows = await db
      .select()
      .from(quizCandidates)
      .where(and(
        inArray(quizCandidates.id, questionIds),
        eq(quizCandidates.status, 'approved'),
      ));

    const qcMap = new Map(qcRows.map(q => [q.id, q]));
    const wrongItemIds = new Set<string>();

    const results: PracticeResultItem[] = answers.map(answer => {
      const qc = qcMap.get(answer.questionId);
      if (!qc) {
        return {
          questionId: answer.questionId,
          questionText: '(question not found)',
          options: [],
          correct: false,
          selectedIndex: answer.selectedIndex,
          correctIndex: -1,
          explanation: '',
        };
      }
      const correct = answer.selectedIndex === qc.suggestedCorrectIndex;
      if (!correct) wrongItemIds.add(qc.kbItemId);
      return {
        questionId: qc.id,
        questionText: qc.questionText,
        options: qc.options,
        correct,
        selectedIndex: answer.selectedIndex,
        correctIndex: qc.suggestedCorrectIndex,
        explanation: qc.explanation,
      };
    });

    const score = results.filter(r => r.correct).length;
    const total = results.length;

    // Recommend topics + remediation KB items from wrong answers
    let recommendedTopics: LearnTopicRef[] = [];
    let remediationItems: RemediationItem[] = [];

    if (wrongItemIds.size > 0) {
      const rels = await db
        .select()
        .from(topicRelationships)
        .where(inArray(topicRelationships.itemId, [...wrongItemIds]));
      const topicIds = [...new Set(rels.map(r => r.topicId))];

      if (topicIds.length > 0) {
        // Topics to display as badges
        const topicRows = await db.select().from(topics).where(inArray(topics.id, topicIds));
        const topicMap = new Map(topicRows.map(t => [t.id, { slug: t.slug, name: t.name }]));
        recommendedTopics = topicRows.map(t => ({ slug: t.slug, name: t.name }));

        // Fetch published KB items tagged with those topics, excluding the wrong items themselves
        const candidateRels = await db
          .select()
          .from(topicRelationships)
          .where(inArray(topicRelationships.topicId, topicIds));

        const candidateIds = [...new Set(
          candidateRels.map(r => r.itemId).filter(id => !wrongItemIds.has(id)),
        )].slice(0, 10);

        if (candidateIds.length > 0) {
          const candidateItems = await db
            .select()
            .from(kbItems)
            .where(and(inArray(kbItems.id, candidateIds), eq(kbItems.status, 'published')));

          const revIds = candidateItems
            .map(i => i.currentRevisionId)
            .filter((id): id is string => id !== null);
          const revRows = revIds.length > 0
            ? await db.select().from(kbRevisions).where(inArray(kbRevisions.id, revIds))
            : [];
          const revMap = new Map(revRows.map(r => [r.id, r]));

          remediationItems = candidateItems.slice(0, 4).map(item => {
            const rev = item.currentRevisionId ? revMap.get(item.currentRevisionId) : undefined;
            const content = rev?.content ?? '';
            const itemTopics = candidateRels
              .filter(r => r.itemId === item.id)
              .map(r => topicMap.get(r.topicId))
              .filter((t): t is LearnTopicRef => t !== undefined);
            return {
              title: item.title,
              excerpt: content.slice(0, 300) + (content.length > 300 ? '…' : ''),
              topics: itemTopics,
            };
          });
        }
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Record progress and attempt history if learner identity provided
    if (learnerId) {
      const passed = percentage >= 70;
      await Promise.all([
        passed
          ? progressSvc.recordCompletion(learnerId, moduleId, score, total, percentage)
          : progressSvc.recordStart(learnerId, moduleId),
        db.insert(practiceAttempts).values({
          id: uuid(),
          learnerId,
          moduleId,
          score,
          total,
          percentage,
          passed,
          results: results as unknown as Record<string, unknown>[],
        }),
      ]);
    }

    return { score, total, percentage, results, recommendedTopics, remediationItems };
  }
}
