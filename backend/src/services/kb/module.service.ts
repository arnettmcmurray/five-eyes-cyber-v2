import { eq, inArray, and, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { learningModules, modulePrerequisites } from '../../db/schema/modules.js';

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  displayOrder: number;
  nextModuleId: string | null;
  estimatedMinutes: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModulePrerequisite {
  id: string;
  slug: string;
  title: string;
}

function toModel(row: typeof learningModules.$inferSelect): LearningModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    published: row.published,
    displayOrder: row.displayOrder,
    nextModuleId: row.nextModuleId ?? null,
    estimatedMinutes: row.estimatedMinutes ?? null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ModuleService {
  async list(): Promise<LearningModule[]> {
    const rows = await db
      .select()
      .from(learningModules)
      .orderBy(asc(learningModules.displayOrder), asc(learningModules.createdAt));
    return rows.map(toModel);
  }

  async listPublished(): Promise<LearningModule[]> {
    const rows = await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.published, true))
      .orderBy(asc(learningModules.displayOrder), asc(learningModules.createdAt));
    return rows.map(toModel);
  }

  async get(id: string): Promise<LearningModule> {
    const [row] = await db.select().from(learningModules).where(eq(learningModules.id, id)).limit(1);
    if (!row) throw new Error(`Module not found: ${id}`);
    return toModel(row);
  }

  async create(input: {
    slug: string; title: string; description: string;
    displayOrder?: number; estimatedMinutes?: number | null; createdBy: string;
  }): Promise<LearningModule> {
    const [row] = await db
      .insert(learningModules)
      .values({ id: uuid(), ...input, displayOrder: input.displayOrder ?? 0 })
      .returning();
    return toModel(row);
  }

  async update(id: string, input: Partial<Pick<LearningModule, 'title' | 'description' | 'displayOrder' | 'nextModuleId' | 'estimatedMinutes'>>): Promise<LearningModule> {
    const [row] = await db
      .update(learningModules)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(learningModules.id, id))
      .returning();
    if (!row) throw new Error(`Module not found: ${id}`);
    return toModel(row);
  }

  async publish(id: string): Promise<LearningModule> {
    const [row] = await db
      .update(learningModules)
      .set({ published: true, updatedAt: new Date() })
      .where(eq(learningModules.id, id))
      .returning();
    if (!row) throw new Error(`Module not found: ${id}`);
    return toModel(row);
  }

  async unpublish(id: string): Promise<LearningModule> {
    const [row] = await db
      .update(learningModules)
      .set({ published: false, updatedAt: new Date() })
      .where(eq(learningModules.id, id))
      .returning();
    if (!row) throw new Error(`Module not found: ${id}`);
    return toModel(row);
  }

  async getPrerequisites(id: string): Promise<ModulePrerequisite[]> {
    const rels = await db
      .select()
      .from(modulePrerequisites)
      .where(eq(modulePrerequisites.moduleId, id));
    if (rels.length === 0) return [];
    const ids = rels.map(r => r.prerequisiteModuleId);
    const mods = await db.select().from(learningModules).where(inArray(learningModules.id, ids));
    return mods.map(m => ({ id: m.id, slug: m.slug, title: m.title }));
  }

  /** Replaces all prerequisites for a module. Pass [] to clear. */
  async setPrerequisites(id: string, prerequisiteIds: string[]): Promise<ModulePrerequisite[]> {
    await db.delete(modulePrerequisites).where(eq(modulePrerequisites.moduleId, id));
    if (prerequisiteIds.length === 0) return [];

    // Validate all IDs exist
    const found = await db
      .select()
      .from(learningModules)
      .where(and(inArray(learningModules.id, prerequisiteIds)));
    const foundIds = new Set(found.map(m => m.id));
    const invalid = prerequisiteIds.filter(pid => !foundIds.has(pid));
    if (invalid.length > 0) throw new Error(`Unknown module IDs: ${invalid.join(', ')}`);

    await db.insert(modulePrerequisites).values(
      prerequisiteIds.map(pid => ({ id: uuid(), moduleId: id, prerequisiteModuleId: pid })),
    );

    return found.map(m => ({ id: m.id, slug: m.slug, title: m.title }));
  }

  /** Modules that list this module as a prerequisite (reverse lookup). */
  async getDependents(id: string): Promise<ModulePrerequisite[]> {
    const rels = await db
      .select()
      .from(modulePrerequisites)
      .where(eq(modulePrerequisites.prerequisiteModuleId, id));
    if (rels.length === 0) return [];
    const ids = rels.map(r => r.moduleId);
    const mods = await db.select().from(learningModules).where(inArray(learningModules.id, ids));
    return mods.map(m => ({ id: m.id, slug: m.slug, title: m.title }));
  }

  async delete(id: string): Promise<void> {
    await db.delete(learningModules).where(eq(learningModules.id, id));
  }
}
