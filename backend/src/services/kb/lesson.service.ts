import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { lessonContentLinks } from '../../db/schema/lesson-links.js';
import type { LessonContentLink } from '../../models/kb/lesson.js';

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
}
