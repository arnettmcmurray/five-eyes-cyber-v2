import { eq, and, isNull, lt, lte, desc, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { sourceTrustLevels } from '../../db/schema/source-trust-levels.js';
import { sources } from '../../db/schema/sources.js';
import { sourceDomains } from '../../db/schema/source-domains.js';
import { freshnessRules } from '../../db/schema/freshness-rules.js';
import { reviewQueue } from '../../db/schema/review-queue.js';
import { contentAlerts } from '../../db/schema/content-alerts.js';
import { publishDecisions } from '../../db/schema/publish-decisions.js';
import { kbItems } from '../../db/schema/kb-items.js';

// ── Trust Levels ─────────────────────────────────────────────────────────────

export class GovernanceService {

  async listTrustLevels() {
    return db.select().from(sourceTrustLevels).orderBy(asc(sourceTrustLevels.rank));
  }

  async getTrustLevelByCode(code: string) {
    const [row] = await db
      .select()
      .from(sourceTrustLevels)
      .where(eq(sourceTrustLevels.code, code))
      .limit(1);
    return row ?? null;
  }

  // ── Sources ─────────────────────────────────────────────────────────────────

  async listSources() {
    return db.select().from(sources).orderBy(asc(sources.name));
  }

  async getSourceById(id: string) {
    const [row] = await db.select().from(sources).where(eq(sources.id, id)).limit(1);
    return row ?? null;
  }

  async createSource(data: {
    name: string;
    sourceType: typeof sources.$inferInsert['sourceType'];
    domain: string;
    baseUrl?: string | null;
    trustLevelId: string;
    status?: typeof sources.$inferInsert['status'];
    ingestMode?: typeof sources.$inferInsert['ingestMode'];
    ownerUserId?: string | null;
    notes?: string | null;
  }) {
    const [row] = await db
      .insert(sources)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async updateSource(id: string, data: Partial<{
    name: string;
    sourceType: typeof sources.$inferInsert['sourceType'];
    domain: string;
    baseUrl: string | null;
    trustLevelId: string;
    status: typeof sources.$inferInsert['status'];
    ingestMode: typeof sources.$inferInsert['ingestMode'];
    ownerUserId: string | null;
    notes: string | null;
  }>) {
    const [row] = await db
      .update(sources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sources.id, id))
      .returning();
    return row ?? null;
  }

  // ── Freshness Rules ──────────────────────────────────────────────────────────

  async listFreshnessRules() {
    return db.select().from(freshnessRules).orderBy(asc(freshnessRules.appliesToType), asc(freshnessRules.appliesToValue));
  }

  async createFreshnessRule(data: {
    appliesToType: string;
    appliesToValue: string;
    reviewAfterDays: number;
    expireAfterDays: number;
    alertBeforeDays?: number;
    active?: boolean;
  }) {
    const [row] = await db
      .insert(freshnessRules)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async updateFreshnessRule(id: string, data: Partial<typeof freshnessRules.$inferInsert>) {
    const [row] = await db
      .update(freshnessRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(freshnessRules.id, id))
      .returning();
    return row ?? null;
  }

  // ── Review Queue ─────────────────────────────────────────────────────────────

  async listReviewQueue(filter?: { status?: string; priority?: string }) {
    let query = db.select().from(reviewQueue);
    if (filter?.status) {
      query = query.where(eq(reviewQueue.status, filter.status as typeof reviewQueue.$inferSelect['status'])) as typeof query;
    }
    return query.orderBy(asc(reviewQueue.openedAt));
  }

  async getReviewQueueItem(id: string) {
    const [row] = await db.select().from(reviewQueue).where(eq(reviewQueue.id, id)).limit(1);
    return row ?? null;
  }

  async enqueueForReview(data: {
    contentItemId: string;
    sourceId?: string | null;
    reasonCode: string;
    priority?: typeof reviewQueue.$inferInsert['priority'];
    assignedToUserId?: string | null;
  }) {
    const [row] = await db
      .insert(reviewQueue)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async resolveReviewQueueItem(id: string, data: {
    status: 'approved' | 'rejected' | 'deferred';
    resolutionNotes?: string | null;
    resolvedByUserId?: string;
  }) {
    const [row] = await db
      .update(reviewQueue)
      .set({
        status: data.status,
        resolutionNotes: data.resolutionNotes ?? null,
        resolvedAt: new Date(),
      })
      .where(eq(reviewQueue.id, id))
      .returning();
    return row ?? null;
  }

  // ── Content Alerts ───────────────────────────────────────────────────────────

  async listAlerts(filter?: { status?: string; severity?: string }) {
    let query = db.select().from(contentAlerts);
    if (filter?.status) {
      query = query.where(eq(contentAlerts.status, filter.status as typeof contentAlerts.$inferSelect['status'])) as typeof query;
    }
    return query.orderBy(desc(contentAlerts.createdAt));
  }

  async createAlert(data: {
    contentItemId: string;
    sourceId?: string | null;
    alertType: string;
    severity?: typeof contentAlerts.$inferInsert['severity'];
    message: string;
  }) {
    const [row] = await db
      .insert(contentAlerts)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async updateAlert(id: string, data: Partial<{
    status: typeof contentAlerts.$inferSelect['status'];
    resolvedAt: Date | null;
  }>) {
    const [row] = await db
      .update(contentAlerts)
      .set(data)
      .where(eq(contentAlerts.id, id))
      .returning();
    return row ?? null;
  }

  // ── Publish Decisions ────────────────────────────────────────────────────────

  async recordPublishDecision(data: {
    contentItemId: string;
    decision: 'approved' | 'rejected' | 'deferred';
    reasonCode?: string | null;
    notes?: string | null;
    decidedByUserId: string;
  }) {
    const [row] = await db
      .insert(publishDecisions)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async listPublishDecisionsForItem(contentItemId: string) {
    return db
      .select()
      .from(publishDecisions)
      .where(eq(publishDecisions.contentItemId, contentItemId))
      .orderBy(desc(publishDecisions.decidedAt));
  }

  // ── Governance Summary ───────────────────────────────────────────────────────

  async getGovernanceSummary(itemId: string) {
    const [item] = await db.select().from(kbItems).where(eq(kbItems.id, itemId)).limit(1);
    if (!item) return null;

    const [queueItems, alerts, decisions] = await Promise.all([
      db.select().from(reviewQueue).where(eq(reviewQueue.contentItemId, itemId)),
      db.select().from(contentAlerts).where(eq(contentAlerts.contentItemId, itemId)),
      db.select().from(publishDecisions).where(eq(publishDecisions.contentItemId, itemId)).orderBy(desc(publishDecisions.decidedAt)).limit(5),
    ]);

    let source = null;
    let trustLevel = null;
    if (item.sourceId) {
      const [s] = await db.select().from(sources).where(eq(sources.id, item.sourceId)).limit(1);
      source = s ?? null;
    }
    if (item.sourceTrustLevelId) {
      const [tl] = await db.select().from(sourceTrustLevels).where(eq(sourceTrustLevels.id, item.sourceTrustLevelId)).limit(1);
      trustLevel = tl ?? null;
    }

    return {
      item: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        status: item.status,
        reviewStatus: item.reviewStatus,
        freshnessStatus: item.freshnessStatus,
        freshnessCycle: item.freshnessCycle,
        learnerVisible: item.learnerVisible,
        lastReviewedAt: item.lastReviewedAt?.toISOString() ?? null,
        nextReviewAt: item.nextReviewAt?.toISOString() ?? null,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        sourceId: item.sourceId,
        sourceUrl: item.sourceUrl,
        sourceTrustLevelId: item.sourceTrustLevelId,
      },
      source,
      trustLevel,
      openReviewItems: queueItems.filter(q => q.status === 'pending' || q.status === 'in_review'),
      openAlerts: alerts.filter(a => a.status === 'open' || a.status === 'acknowledged'),
      recentDecisions: decisions,
    };
  }

  // ── Admin Summary ────────────────────────────────────────────────────────────

  async getAdminGovernanceSummary() {
    const [allItems, openAlerts, pendingReviews] = await Promise.all([
      db.select({
        id: kbItems.id,
        reviewStatus: kbItems.reviewStatus,
        freshnessStatus: kbItems.freshnessStatus,
        learnerVisible: kbItems.learnerVisible,
        status: kbItems.status,
      }).from(kbItems),
      db.select().from(contentAlerts).where(eq(contentAlerts.status, 'open')),
      db.select().from(reviewQueue).where(eq(reviewQueue.status, 'pending')),
    ]);

    const published = allItems.filter(i => i.status === 'published');
    return {
      total: allItems.length,
      published: published.length,
      learnerVisible: allItems.filter(i => i.learnerVisible).length,
      byReviewStatus: countBy(allItems, 'reviewStatus'),
      byFreshnessStatus: countBy(allItems, 'freshnessStatus'),
      openAlerts: openAlerts.length,
      criticalAlerts: openAlerts.filter(a => a.severity === 'critical').length,
      pendingReviews: pendingReviews.length,
      blockingReviews: pendingReviews.filter(r => r.priority === 'blocking').length,
    };
  }

  // ── Stale Scan ────────────────────────────────────────────────────────────────

  async scanForStaleItems(): Promise<{ flagged: number; items: { id: string; slug: string; reason: string }[] }> {
    const now = new Date();
    const items = await db
      .select({
        id: kbItems.id,
        slug: kbItems.slug,
        status: kbItems.status,
        nextReviewAt: kbItems.nextReviewAt,
        freshnessStatus: kbItems.freshnessStatus,
        freshnessCycle: kbItems.freshnessCycle,
        publishedAt: kbItems.publishedAt,
        lastReviewedAt: kbItems.lastReviewedAt,
      })
      .from(kbItems)
      .where(eq(kbItems.status, 'published'));

    const flagged: { id: string; slug: string; reason: string }[] = [];

    for (const item of items) {
      if (item.nextReviewAt && item.nextReviewAt < now) {
        flagged.push({ id: item.id, slug: item.slug, reason: 'next_review_overdue' });
        continue;
      }
      // Flag items published over 365 days ago with no freshnessCycle set
      if (item.publishedAt && !item.freshnessCycle) {
        const daysSincePublish = (now.getTime() - item.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublish > 365) {
          flagged.push({ id: item.id, slug: item.slug, reason: 'no_freshness_cycle_over_365d' });
        }
      }
    }

    return { flagged: flagged.length, items: flagged };
  }

  // ── Backfill Defaults ─────────────────────────────────────────────────────────

  async backfillGovernanceDefaults(): Promise<{ updated: number }> {
    // Set learnerVisible=true and reviewStatus='approved' for all existing published items
    // that don't yet have governance fields populated
    const result = await db
      .update(kbItems)
      .set({
        learnerVisible: true,
        reviewStatus: 'approved',
        freshnessStatus: 'current',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(kbItems.status, 'published'),
          isNull(kbItems.reviewStatus),
        ),
      )
      .returning({ id: kbItems.id });

    return { updated: result.length };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = String(item[key] ?? 'null');
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return counts;
}
