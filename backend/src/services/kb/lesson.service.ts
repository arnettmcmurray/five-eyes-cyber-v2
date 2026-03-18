import { eq, inArray, and, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { lessonContentLinks } from '../../db/schema/lesson-links.js';
import { kbItems } from '../../db/schema/kb-items.js';
import { kbRevisions } from '../../db/schema/kb-revisions.js';
import { quizCandidates } from '../../db/schema/quiz-candidates.js';
import { learningModules } from '../../db/schema/modules.js';
import type { LessonContentLink } from '../../models/kb/lesson.js';

export interface ModuleContentItem {
  link: LessonContentLink;
  item: {
    id: string; slug: string; title: string; type: string;
    status: string; tags: string[]; currentRevisionId: string | null;
  };
  content: string;
  quizCandidates: Array<{
    id: string; questionText: string; options: string[];
    suggestedCorrectIndex: number; explanation: string; confidence: number;
  }>;
}

export interface ModuleContent {
  module: { id: string; slug: string; title: string; description: string };
  items: ModuleContentItem[];
}

function toModel(row: typeof lessonContentLinks.$inferSelect): LessonContentLink {
  return {
    id: row.id,
    moduleId: row.moduleId,
    kbItemId: row.kbItemId,
    role: row.role as LessonContentLink['role'],
    order: row.order,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
  };
}

export class KBLessonService {
  async linkToModule(data: Omit<LessonContentLink, 'id' | 'addedAt'>): Promise<LessonContentLink> {
    const [row] = await db
      .insert(lessonContentLinks)
      .values({
        id: uuid(),
        moduleId: data.moduleId,
        kbItemId: data.kbItemId,
        role: data.role,
        order: data.order,
        addedBy: data.addedBy,
      })
      .returning();
    return toModel(row);
  }

  async getLinksForModule(moduleId: string): Promise<LessonContentLink[]> {
    const rows = await db
      .select()
      .from(lessonContentLinks)
      .where(eq(lessonContentLinks.moduleId, moduleId));
    return rows.map(toModel);
  }

  async getLinksForItem(kbItemId: string): Promise<LessonContentLink[]> {
    const rows = await db
      .select()
      .from(lessonContentLinks)
      .where(eq(lessonContentLinks.kbItemId, kbItemId));
    return rows.map(toModel);
  }

  async removeLink(id: string): Promise<void> {
    await db.delete(lessonContentLinks).where(eq(lessonContentLinks.id, id));
  }

  async getModuleContent(moduleId: string): Promise<ModuleContent> {
    const [mod] = await db.select().from(learningModules).where(eq(learningModules.id, moduleId)).limit(1);
    if (!mod) throw new Error(`Module not found: ${moduleId}`);

    const links = await db
      .select()
      .from(lessonContentLinks)
      .where(eq(lessonContentLinks.moduleId, moduleId))
      .orderBy(asc(lessonContentLinks.order));

    if (links.length === 0) {
      return {
        module: { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description },
        items: [],
      };
    }

    const itemIds = links.map(l => l.kbItemId);

    const [itemRows, revRows, qcRows] = await Promise.all([
      db.select().from(kbItems).where(inArray(kbItems.id, itemIds)),
      db.select().from(kbRevisions).where(
        and(inArray(kbRevisions.itemId, itemIds))
      ),
      db.select().from(quizCandidates).where(
        and(inArray(quizCandidates.kbItemId, itemIds), eq(quizCandidates.status, 'approved'))
      ),
    ]);

    const itemMap = new Map(itemRows.map(r => [r.id, r]));
    const revMap = new Map(revRows.map(r => [r.id, r]));
    const qcsByItem = new Map<string, typeof qcRows>();
    for (const qc of qcRows) {
      const list = qcsByItem.get(qc.kbItemId) ?? [];
      list.push(qc);
      qcsByItem.set(qc.kbItemId, list);
    }

    const ROLE_ORDER: Record<string, number> = { 'prerequisite-reading': 0, primary: 1, supplementary: 2 };

    const items: ModuleContentItem[] = links
      .sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || a.order - b.order)
      .map(link => {
        const item = itemMap.get(link.kbItemId);
        if (!item) return null;
        const rev = item.currentRevisionId ? revMap.get(item.currentRevisionId) : undefined;
        const qcs = qcsByItem.get(item.id) ?? [];
        return {
          link: toModel(link),
          item: {
            id: item.id, slug: item.slug, title: item.title, type: item.type as string,
            status: item.status as string, tags: item.tags, currentRevisionId: item.currentRevisionId,
          },
          content: rev?.content ?? '',
          quizCandidates: qcs.map(q => ({
            id: q.id, questionText: q.questionText, options: q.options,
            suggestedCorrectIndex: q.suggestedCorrectIndex, explanation: q.explanation,
            confidence: q.confidence,
          })),
        };
      })
      .filter((x): x is ModuleContentItem => x !== null);

    return {
      module: { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description },
      items,
    };
  }
}
