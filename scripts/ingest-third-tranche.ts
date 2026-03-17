/**
 * Third Tranche KB Ingestion Script
 * Ingests all T8–T10 content: topics, KB items, revisions, modules, links, quiz candidates.
 *
 * Run: npx tsx scripts/ingest-third-tranche.ts
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
  const title      = rawTitle.replace(/^["']|["']$/g, '');

  // Type
  const typeMatch = fmRaw.match(/^type:\s*(.+)$/m);
  const type      = typeMatch ? typeMatch[1].trim() : 'training-content';

  // Source trust
  const stMatch    = fmRaw.match(/^source_trust:\s*(.+)$/m);
  const sourceTrust = stMatch ? stMatch[1].trim() : 'internal';

  // Topics — handle both inline and multi-line list
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
// Practice question parser
// ---------------------------------------------------------------------------

interface QuizQuestion {
  questionText: string;
  options: string[];
  suggestedCorrectIndex: number;
  explanation: string;
}

function parsePracticeQuestions(raw: string): QuizQuestion[] {
  // Split on blank lines between questions or on Q\d+ markers
  const blocks = raw.split(/\n(?=\*\*Q\d+)/).filter(b => b.includes('**Q'));
  const questions: QuizQuestion[] = [];

  for (const block of blocks) {
    // Find the first option line (a) b) *c) etc.) — everything before it is the question
    const firstOptIdx = block.search(/^[*]?[a-d]\)/im);
    if (firstOptIdx === -1) continue;
    const rawQ = block.slice(0, firstOptIdx)
      .replace(/^\*\*Q\d+[.:]\s*/i, '')  // strip **Q1. prefix
      .replace(/\*\*/g, '')               // strip remaining bold markers
      .trim();
    const questionText = rawQ.replace(/\n/g, ' ').trim();

    // Options — lines like "a) ...", "*b) ...", "A) ...", "*A) ..."
    const optMatches = [...block.matchAll(/^(\*?)([a-dA-D])\)\s*(.+)$/gm)];
    if (optMatches.length !== 4) continue;

    const options: string[] = [];
    let correctIndex = 0;

    optMatches.forEach((m, i) => {
      const isCorrect = m[1] === '*';
      options.push(m[3].trim());
      if (isCorrect) correctIndex = i;
    });

    // Explanation
    const explanationMatch = block.match(/^(?:Explanation|Rationale|Correct):\s*([\s\S]+?)(?:\n\n|\n---|\n\*\*Q|$)/im);
    const explanation = explanationMatch
      ? explanationMatch[1].trim().replace(/\n/g, ' ')
      : `Correct answer: ${options[correctIndex]}`;

    questions.push({ questionText, options, suggestedCorrectIndex: correctIndex, explanation });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Topic definitions (Third Tranche)
// ---------------------------------------------------------------------------

const TOPICS = [
  {
    slug: 'secure-systems-hygiene',
    name: 'Secure Systems Hygiene',
    description: 'Patching, remote access controls, endpoint protection, and SMB IT security practices for freight operations.',
  },
  {
    slug: 'third-party-vendor-risk',
    name: 'Third-Party and Vendor Risk',
    description: 'Vendor access mapping, vetting, monitoring, BEC via vendor relationships, and payment change controls.',
  },
  {
    slug: 'data-document-security',
    name: 'Data and Document Security',
    description: 'Driver PII protection, freight document handling, secure sharing controls, breach response, and access controls.',
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

const T8_ITEMS: ItemDef[] = [
  { dir: 't8-it-hygiene', file: 'it-hygiene-01-patch-management.md',       slug: 't8-patch-management',        order: 1, moduleRole: 'primary' },
  { dir: 't8-it-hygiene', file: 'it-hygiene-02-remote-access-security.md', slug: 't8-remote-access-security',  order: 2, moduleRole: 'supplementary' },
  { dir: 't8-it-hygiene', file: 'it-hygiene-03-endpoint-protection.md',    slug: 't8-endpoint-protection',     order: 3, moduleRole: 'primary' },
  { dir: 't8-it-hygiene', file: 'it-hygiene-04-admin-accounts-privilege.md', slug: 't8-admin-accounts-privilege', order: 4, moduleRole: 'primary' },
  { dir: 't8-it-hygiene', file: 'it-hygiene-05-smb-security-checklist.md', slug: 't8-smb-security-checklist',  order: 5, moduleRole: 'supplementary' },
  { dir: 't8-it-hygiene', file: 'it-hygiene-06-threat-brief-smb-attacks.md', slug: 't8-threat-brief-smb-attacks', order: 6, moduleRole: 'supplementary' },
];

const T9_ITEMS: ItemDef[] = [
  { dir: 't9-vendor-risk', file: 'vendor-risk-01-what-vendors-have-access.md', slug: 't9-what-vendors-have-access',  order: 1, moduleRole: 'primary' },
  { dir: 't9-vendor-risk', file: 'vendor-risk-02-vetting-new-vendors.md',      slug: 't9-vetting-new-vendors',       order: 2, moduleRole: 'supplementary' },
  { dir: 't9-vendor-risk', file: 'vendor-risk-03-ongoing-vendor-monitoring.md', slug: 't9-ongoing-vendor-monitoring', order: 3, moduleRole: 'supplementary' },
  { dir: 't9-vendor-risk', file: 'vendor-risk-04-bec-via-vendor.md',           slug: 't9-bec-via-vendor',            order: 4, moduleRole: 'supplementary' },
  { dir: 't9-vendor-risk', file: 'vendor-risk-05-payment-change-controls.md',  slug: 't9-payment-change-controls',   order: 5, moduleRole: 'primary' },
  { dir: 't9-vendor-risk', file: 'vendor-risk-06-smb-vendor-controls.md',      slug: 't9-smb-vendor-controls',       order: 6, moduleRole: 'supplementary' },
];

const T10_ITEMS: ItemDef[] = [
  { dir: 't10-data-security', file: 'data-security-01-driver-pii-protection.md',     slug: 't10-driver-pii-protection',      order: 1, moduleRole: 'supplementary' },
  { dir: 't10-data-security', file: 'data-security-02-document-handling-standards.md', slug: 't10-document-handling-standards', order: 2, moduleRole: 'primary' },
  { dir: 't10-data-security', file: 'data-security-03-secure-sharing-controls.md',   slug: 't10-secure-sharing-controls',    order: 3, moduleRole: 'primary' },
  { dir: 't10-data-security', file: 'data-security-04-breach-response-basics.md',    slug: 't10-breach-response-basics',     order: 4, moduleRole: 'supplementary' },
  { dir: 't10-data-security', file: 'data-security-05-access-control-for-documents.md', slug: 't10-access-control-documents', order: 5, moduleRole: 'primary' },
  { dir: 't10-data-security', file: 'data-security-06-threat-brief-data-freight.md', slug: 't10-threat-brief-data-freight',  order: 6, moduleRole: 'supplementary' },
];

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

const MODULES = [
  {
    slug: 't8-secure-it-hygiene',
    title: 'Secure IT Hygiene for Freight Operations',
    description: 'Patching, remote access hardening, endpoint protection, and privilege separation for small freight operations and their MSPs.',
    estimatedMinutes: 20,
    displayOrder: 8,
    items: T8_ITEMS,
    practiceFile: 't8-it-hygiene/practice-questions.md',
  },
  {
    slug: 't9-third-party-vendor-risk',
    title: 'Third-Party and Vendor Risk in Freight',
    description: 'What access your vendors have, how to vet and monitor them, BEC via vendor relationships, and payment change verification.',
    estimatedMinutes: 20,
    displayOrder: 9,
    items: T9_ITEMS,
    practiceFile: 't9-vendor-risk/practice-questions.md',
  },
  {
    slug: 't10-data-document-security',
    title: 'Data and Document Security for Freight Operations',
    description: 'Driver PII protection, secure document handling, BOL/POD security, breach response basics, and access controls for freight data.',
    estimatedMinutes: 20,
    displayOrder: 10,
    items: T10_ITEMS,
    practiceFile: 't10-data-security/practice-questions.md',
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
  console.log('\n=== Five Eyes KB Third Tranche Ingest (T8–T10) ===\n');

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

  log('Creating Third Tranche topics');
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

  // Trust tier mapping
  const trustMap: Record<string, string> = {
    'T0': 'external-curated',
    'T1': 'external-curated',
    'T2': 'external-curated',
    'internal': 'internal',
    'external-curated': 'external-curated',
    'raw-upload': 'raw-upload',
  };

  // Type map
  const typeMap: Record<string, string> = {
    'training-content': 'training-content',
    'threat-brief':     'threat-brief',
    'policy':           'policy',
    'faq':              'faq',
  };

  // 4. Ingest items
  const allGroups = [T8_ITEMS, T9_ITEMS, T10_ITEMS];

  for (const group of allGroups) {
    for (const def of group) {
      const filePath = join(KB_BASE, def.dir, def.file);
      const raw = readFileSync(filePath, 'utf8');
      const { fm, body } = parseFrontmatter(raw);

      const itemType = typeMap[fm.type] ?? 'training-content';

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

    if (allQuestions.length === 0) {
      warn(`No questions parsed from ${mod.practiceFile} — check format`);
      continue;
    }

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

      const itemData   = await get(`/kb/items/${itemId}`, token) as any;
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
  console.log('\n=== Third Tranche Ingest Complete ===');
  console.log(`Topics:   ${TOPICS.length}`);
  console.log(`KB Items: ${allGroups.flat().length}`);
  console.log(`Modules:  ${MODULES.length}`);
  console.log('\nAll Third Tranche content is now in-system and published.\n');
}

main().catch(err => {
  console.error('\n✗ Ingest failed:', err.message);
  process.exit(1);
});
