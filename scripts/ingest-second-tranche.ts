/**
 * Second Tranche KB Ingestion Script
 * Ingests all T5–T7 content: topics, KB items, revisions, modules, links, quiz candidates.
 *
 * Run: npx tsx scripts/ingest-second-tranche.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const API      = 'http://localhost:3001';
const API_KEY  = 'dev-local-key';
const ADMIN_USER = 'arnettmcmurray@gmail.com';
const ADMIN_PASS = 'arnett-five-eyes-2026';
const KB_BASE  = join(import.meta.dirname, '../out/kb-content');

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function request(
  path: string,
  method: string,
  body?: unknown,
  token?: string,
): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const post  = (path: string, body: unknown, token?: string) => request(path, 'POST', body, token);
const get   = (path: string, token?: string) => request(path, 'GET', undefined, token);
const patch = (path: string, body: unknown, token?: string) => request(path, 'PATCH', body, token);

// ---------------------------------------------------------------------------
// Frontmatter parser — handles multi-line YAML list for topics + quoted titles
// ---------------------------------------------------------------------------

interface Frontmatter {
  title: string;
  type: string;
  topics: string[];
  source_trust: string;
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('No frontmatter found');
  const fmRaw = match[1];
  const body  = match[2].trim();

  // Title — may be quoted
  const titleMatch = fmRaw.match(/^title:\s*(.+)$/m);
  const rawTitle   = titleMatch ? titleMatch[1].trim() : '';
  const title      = rawTitle.replace(/^["']|["']$/g, ''); // strip surrounding quotes

  // Type
  const typeMatch = fmRaw.match(/^type:\s*(.+)$/m);
  const type      = typeMatch ? typeMatch[1].trim() : 'training-content';

  // Source trust
  const stMatch    = fmRaw.match(/^source_trust:\s*(.+)$/m);
  const sourceTrust = stMatch ? stMatch[1].trim() : 'internal';

  // Topics — handle both inline `topics: Foo` and multi-line list
  //   topics:
  //     - Foo
  //     - Bar
  const topicsInlineMatch = fmRaw.match(/^topics:\s*(.+)$/m);
  const topicsListMatches = [...fmRaw.matchAll(/^  - (.+)$/gm)];

  let topics: string[];
  if (topicsListMatches.length > 0) {
    topics = topicsListMatches.map(m => m[1].trim()).filter(Boolean);
  } else if (topicsInlineMatch) {
    topics = topicsInlineMatch[1].split(',').map(t => t.trim()).filter(Boolean);
  } else {
    topics = [];
  }

  return { fm: { title, type, topics, source_trust: sourceTrust }, body };
}

// ---------------------------------------------------------------------------
// Practice question parser (same as First Tranche)
// ---------------------------------------------------------------------------

interface QuizQuestion {
  questionText: string;
  options: string[];
  suggestedCorrectIndex: number;
  explanation: string;
}

function parsePracticeQuestions(raw: string): QuizQuestion[] {
  const blocks    = raw.split(/\n---\n/).filter(b => b.includes('**Q'));
  const questions: QuizQuestion[] = [];

  for (const block of blocks) {
    const qMatch = block.match(/\*\*Q\d+\.\*\*\s*([\s\S]*?)(?=\n[A-D]\))/);
    if (!qMatch) continue;
    const questionText = qMatch[1].trim().replace(/\n/g, ' ');

    const optMatches = [...block.matchAll(/^(\*?)([A-D])\)\s*(.+)$/gm)];
    if (optMatches.length !== 4) continue;

    const options: string[] = [];
    let correctIndex = 0;

    optMatches.forEach((m, i) => {
      const isCorrect = m[1] === '*';
      options.push(m[3].trim());
      if (isCorrect) correctIndex = i;
    });

    questions.push({
      questionText,
      options,
      suggestedCorrectIndex: correctIndex,
      explanation: `Correct: ${options[correctIndex]}`,
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Topic definitions (Second Tranche)
// ---------------------------------------------------------------------------

const TOPICS = [
  {
    slug: 'ransomware-operational-resilience',
    name: 'Ransomware & Operational Resilience',
    description: 'Ransomware threats targeting freight operations, prevention controls, ELD/TMS resilience, and response playbooks.',
  },
  {
    slug: 'incident-reporting-response',
    name: 'Incident Reporting & Response',
    description: 'Identifying, escalating, and reporting cyber incidents — internal escalation, regulatory obligations, and evidence preservation.',
  },
  {
    slug: 'mobile-byod-security',
    name: 'Mobile Device and BYOD Security',
    description: 'Mobile security for freight workers — ELD/telematics security, BYOD policy, smishing, and app safety.',
  },
];

const topicNameToId = new Map<string, string>();

// ---------------------------------------------------------------------------
// Item definitions
// ---------------------------------------------------------------------------

interface ItemDef {
  dir: string;
  file: string;
  slug: string;
  order: number;
  moduleRole: 'primary' | 'supplementary';
}

const T5_ITEMS: ItemDef[] = [
  { dir: 't5-ransomware', file: 'kb-01-ransomware-in-freight.md',      slug: 't5-ransomware-in-freight',       order: 1, moduleRole: 'supplementary' },
  { dir: 't5-ransomware', file: 'kb-02-operational-impact.md',         slug: 't5-operational-impact',          order: 2, moduleRole: 'primary' },
  { dir: 't5-ransomware', file: 'kb-03-prevention-controls.md',        slug: 't5-prevention-controls',         order: 3, moduleRole: 'primary' },
  { dir: 't5-ransomware', file: 'kb-04-backup-recovery-standard.md',   slug: 't5-backup-recovery-standard',    order: 4, moduleRole: 'supplementary' },
  { dir: 't5-ransomware', file: 'kb-05-early-warning-signs.md',        slug: 't5-early-warning-signs',         order: 5, moduleRole: 'primary' },
  { dir: 't5-ransomware', file: 'kb-06-eld-telematics-threat.md',      slug: 't5-eld-telematics-threat',       order: 6, moduleRole: 'supplementary' },
  { dir: 't5-ransomware', file: 'kb-07-response-playbook.md',          slug: 't5-response-playbook',           order: 7, moduleRole: 'supplementary' },
  { dir: 't5-ransomware', file: 'kb-08-ransom-payment-policy.md',      slug: 't5-ransom-payment-policy',       order: 8, moduleRole: 'supplementary' },
];

const T6_ITEMS: ItemDef[] = [
  { dir: 't6-incident-response', file: 'kb-01-what-counts-as-incident.md', slug: 't6-what-counts-as-incident',  order: 1, moduleRole: 'primary' },
  { dir: 't6-incident-response', file: 'kb-02-internal-escalation.md',     slug: 't6-internal-escalation',      order: 2, moduleRole: 'supplementary' },
  { dir: 't6-incident-response', file: 'kb-03-reporting-obligations.md',   slug: 't6-reporting-obligations',    order: 3, moduleRole: 'primary' },
  { dir: 't6-incident-response', file: 'kb-04-law-enforcement-reporting.md', slug: 't6-law-enforcement-reporting', order: 4, moduleRole: 'supplementary' },
  { dir: 't6-incident-response', file: 'kb-05-evidence-preservation.md',   slug: 't6-evidence-preservation',    order: 5, moduleRole: 'primary' },
  { dir: 't6-incident-response', file: 'kb-06-freight-specific-ir.md',     slug: 't6-freight-specific-ir',      order: 6, moduleRole: 'primary' },
  { dir: 't6-incident-response', file: 'kb-07-tsa-directive.md',           slug: 't6-tsa-directive',            order: 7, moduleRole: 'supplementary' },
  { dir: 't6-incident-response', file: 'kb-08-incident-communications.md', slug: 't6-incident-communications',  order: 8, moduleRole: 'supplementary' },
];

const T7_ITEMS: ItemDef[] = [
  { dir: 't7-mobile-byod', file: 'kb-01-byod-risk-in-freight.md',          slug: 't7-byod-risk-in-freight',          order: 1, moduleRole: 'supplementary' },
  { dir: 't7-mobile-byod', file: 'kb-02-mobile-security-baseline.md',      slug: 't7-mobile-security-baseline',      order: 2, moduleRole: 'supplementary' },
  { dir: 't7-mobile-byod', file: 'kb-03-safe-app-usage.md',                slug: 't7-safe-app-usage',                order: 3, moduleRole: 'primary' },
  { dir: 't7-mobile-byod', file: 'kb-04-eld-telematics-security.md',       slug: 't7-eld-telematics-security',       order: 4, moduleRole: 'primary' },
  { dir: 't7-mobile-byod', file: 'kb-05-smishing-mobile-phishing.md',      slug: 't7-smishing-mobile-phishing',      order: 5, moduleRole: 'primary' },
  { dir: 't7-mobile-byod', file: 'kb-06-lost-stolen-device.md',            slug: 't7-lost-stolen-device',            order: 6, moduleRole: 'supplementary' },
  { dir: 't7-mobile-byod', file: 'kb-07-mobile-mfa-authentication.md',     slug: 't7-mobile-mfa-authentication',     order: 7, moduleRole: 'supplementary' },
];

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

const MODULES = [
  {
    slug: 't5-ransomware-operational-resilience',
    title: 'Ransomware and Operational Resilience',
    description: 'How ransomware targets freight operations, early warning signs, prevention controls, and response playbooks — including ELD and TMS resilience.',
    estimatedMinutes: 30,
    displayOrder: 5,
    items: T5_ITEMS,
    practiceFile: 't5-ransomware/practice-questions.md',
  },
  {
    slug: 't6-incident-reporting-response',
    title: 'Incident Reporting and Response',
    description: 'What counts as a cyber incident, internal escalation, regulatory reporting obligations, evidence preservation, and freight-specific incident response.',
    estimatedMinutes: 25,
    displayOrder: 6,
    items: T6_ITEMS,
    practiceFile: 't6-incident-response/practice-questions.md',
  },
  {
    slug: 't7-mobile-byod-security',
    title: 'Mobile Device and BYOD Security',
    description: 'Mobile risks for freight workers — ELD security, safe app usage, smishing and WhatsApp fraud, lost device response, and BYOD policy.',
    estimatedMinutes: 20,
    displayOrder: 7,
    items: T7_ITEMS,
    practiceFile: 't7-mobile-byod/practice-questions.md',
  },
];

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

let step = 0;
const log  = (msg: string) => console.log(`[${String(++step).padStart(3, '0')}] ${msg}`);
const ok   = (msg: string) => console.log(`      ✓ ${msg}`);
const warn = (msg: string) => console.warn(`      ⚠ ${msg}`);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n=== Five Eyes KB Second Tranche Ingest (T5–T7) ===\n');

  // 1. Auth
  log('Admin login');
  const auth  = await post('/auth/admin/login', { username: ADMIN_USER, password: ADMIN_PASS }) as any;
  const token = auth.token as string;
  ok(`Authenticated as ${auth.username}`);

  // 2. Topics
  log('Fetching existing topics');
  const existingTopics     = await get('/kb/topics', token) as any[];
  const existingTopicSlugs = new Set(existingTopics.map((t: any) => t.slug));
  for (const t of existingTopics) topicNameToId.set(t.name, t.id);
  ok(`${existingTopics.length} topics in DB`);

  log('Creating Second Tranche topics');
  for (const topic of TOPICS) {
    if (existingTopicSlugs.has(topic.slug)) {
      ok(`Topic exists: ${topic.name}`);
      continue;
    }
    const res = await post('/kb/topics', topic, token) as any;
    topicNameToId.set(topic.name, res.id);
    ok(`Created: ${topic.name} (${res.id})`);
  }

  // 3. Existing items
  log('Fetching existing KB items');
  const existingItems     = await get('/kb/items', token) as any[];
  const existingItemSlugs = new Map<string, string>();
  for (const it of existingItems as any[]) existingItemSlugs.set(it.slug, it.id);
  ok(`${existingItems.length} items in DB`);

  const itemSlugToId = new Map<string, string>(existingItemSlugs);

  // 4. Ingest items
  const allGroups = [T5_ITEMS, T6_ITEMS, T7_ITEMS];

  for (const group of allGroups) {
    for (const def of group) {
      const filePath = join(KB_BASE, def.dir, def.file);
      const raw = readFileSync(filePath, 'utf8');
      const { fm, body } = parseFrontmatter(raw);

      const typeMap: Record<string, string> = {
        'training-content': 'training-content',
        'threat-brief':     'threat-brief',
        'policy':           'policy',
        'faq':              'faq',
      };
      const itemType = typeMap[fm.type] ?? 'training-content';

      // Handle existing items
      if (existingItemSlugs.has(def.slug)) {
        log(`Item exists, skipping: ${def.slug}`);
        const itemId = existingItemSlugs.get(def.slug)!;
        itemSlugToId.set(def.slug, itemId);

        const existing = await get(`/kb/items/${itemId}`, token) as any;
        if (!existing.currentRevisionId) {
          await post(`/kb/items/${itemId}/revisions`, { content: body }, token);
          ok(`Added missing revision`);
        }
        if (existing.status === 'draft') {
          await post(`/kb/items/${itemId}/workflow/submit`, {}, token);
          await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
          ok(`Published`);
        } else if (existing.status === 'under-review') {
          await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
          ok(`Published from under-review`);
        }
        continue;
      }

      log(`Ingesting: ${def.slug}`);

      // Map research trust tiers (T0/T1/T2) to platform sourceTrust values
      const trustMap: Record<string, string> = {
        'T0': 'external-curated',
        'T1': 'external-curated',
        'T2': 'external-curated',
        'internal': 'internal',
        'external-curated': 'external-curated',
        'raw-upload': 'raw-upload',
      };
      const sourceTrust = trustMap[fm.source_trust] ?? 'internal';

      const item = await post('/kb/items', {
        slug: def.slug,
        title: fm.title,
        type: itemType,
        tags: [],
        status: 'draft',
        sourceTrust,
        currentRevisionId: null,
      }, token) as any;

      const itemId: string = item.id;
      itemSlugToId.set(def.slug, itemId);
      ok(`Created item (${itemId})`);

      const rev = await post(`/kb/items/${itemId}/revisions`, { content: body }, token) as any;
      ok(`Revision v${rev.version}`);

      await post(`/kb/items/${itemId}/workflow/submit`, {}, token);
      await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
      ok(`Published`);

      for (const topicName of fm.topics) {
        const topicId = topicNameToId.get(topicName);
        if (!topicId) { warn(`Topic not found: "${topicName}"`); continue; }
        try {
          await post(`/kb/topics/${topicId}/assign`, { itemId, weight: 1.0, assignedBy: 'admin' }, token);
          ok(`Assigned → ${topicName}`);
        } catch (e: any) {
          warn(`Topic assign: ${e.message.slice(0, 60)}`);
        }
      }
    }
  }

  // 5. Modules
  log('Creating / updating modules');
  const existingModules = await get('/kb/modules', token) as any[];
  const existingModSlugs = new Map<string, string>();
  for (const m of existingModules as any[]) existingModSlugs.set(m.slug, m.id);

  const moduleSlugToId = new Map<string, string>(existingModSlugs);

  for (const mod of MODULES) {
    let modId: string;

    if (existingModSlugs.has(mod.slug)) {
      modId = existingModSlugs.get(mod.slug)!;
      log(`Module exists: ${mod.slug} (${modId})`);
      await patch(`/kb/modules/${modId}`, {
        title: mod.title,
        description: mod.description,
        estimatedMinutes: mod.estimatedMinutes,
        displayOrder: mod.displayOrder,
      }, token);
      ok(`Updated metadata`);
    } else {
      log(`Creating module: ${mod.slug}`);
      const res = await post('/kb/modules', {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        displayOrder: mod.displayOrder,
      }, token) as any;
      modId = res.id;
      ok(`Created (${modId})`);

      // estimatedMinutes ignored on create — must PATCH
      await patch(`/kb/modules/${modId}`, { estimatedMinutes: mod.estimatedMinutes }, token);
      ok(`Set estimatedMinutes: ${mod.estimatedMinutes}`);
    }
    moduleSlugToId.set(mod.slug, modId);

    // Link items
    const existingLinks = await get(`/kb/modules/${modId}/links`, token) as any[];
    const linkedItemIds = new Set(existingLinks.map((l: any) => l.kbItemId));

    for (const itemDef of mod.items) {
      const itemId = itemSlugToId.get(itemDef.slug);
      if (!itemId) { warn(`No itemId for ${itemDef.slug}`); continue; }
      if (linkedItemIds.has(itemId)) { ok(`Already linked: ${itemDef.slug}`); continue; }
      await post(`/kb/modules/${modId}/links`, {
        kbItemId: itemId,
        role: itemDef.moduleRole,
        order: itemDef.order,
      }, token);
      ok(`Linked ${itemDef.slug} [${itemDef.moduleRole}]`);
    }

    // Publish module
    try {
      await post(`/kb/modules/${modId}/publish`, {}, token);
      ok(`Published module: ${mod.slug}`);
    } catch {
      ok(`Module already published`);
    }
  }

  // 6. Quiz candidates
  log('Creating quiz candidates');

  for (const mod of MODULES) {
    const practiceFile = join(KB_BASE, mod.practiceFile);
    const raw = readFileSync(practiceFile, 'utf8');
    const allQuestions = parsePracticeQuestions(raw);
    ok(`Parsed ${allQuestions.length} questions from ${mod.practiceFile}`);

    const modId = moduleSlugToId.get(mod.slug)!;
    const items = mod.items;

    for (let i = 0; i < items.length; i++) {
      const itemDef = items[i];
      const itemId  = itemSlugToId.get(itemDef.slug);
      if (!itemId) { warn(`No itemId for ${itemDef.slug}`); continue; }

      const existingQCs = await get(`/kb/items/${itemId}/quiz-candidates`, token) as any[];
      if (existingQCs.length > 0) {
        ok(`${itemDef.slug} already has ${existingQCs.length} QCs`);
        continue;
      }

      const itemData  = await get(`/kb/items/${itemId}`, token) as any;
      const revisionId = itemData.currentRevisionId;
      if (!revisionId) { warn(`No revision for ${itemDef.slug}`); continue; }

      const questionsPerItem = Math.ceil(allQuestions.length / items.length);
      const slice = allQuestions.slice(i * questionsPerItem, (i + 1) * questionsPerItem);
      const final = slice.length > 0 ? slice : allQuestions.slice(-3);

      let created = 0;
      for (const q of final) {
        try {
          const candidate = await post(`/kb/items/${itemId}/quiz-candidates`, {
            revisionId,
            questionText: q.questionText,
            options: q.options,
            suggestedCorrectIndex: q.suggestedCorrectIndex,
            explanation: q.explanation,
            confidence: 0.9,
            status: 'pending-review',
          }, token) as any;
          await post(`/kb/quiz-candidates/${candidate.id}/approve`, {}, token);
          created++;
        } catch (e: any) {
          warn(`QC create failed: ${e.message.slice(0, 80)}`);
        }
      }
      ok(`${itemDef.slug}: ${created} QCs approved`);
    }
  }

  // 7. Summary
  console.log('\n=== Second Tranche Ingest Complete ===');
  console.log(`Topics:   ${TOPICS.length}`);
  console.log(`KB Items: ${allGroups.flat().length}`);
  console.log(`Modules:  ${MODULES.length}`);
  console.log('\nAll Second Tranche content is now in-system and published.\n');
}

main().catch(err => {
  console.error('\n✗ Ingest failed:', err.message);
  process.exit(1);
});
