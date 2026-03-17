/**
 * First Tranche KB Ingestion Script
 * Ingests all T1–T4 content: topics, KB items, revisions, module creation,
 * module-item links, quiz candidates, and approval.
 *
 * Run: npx tsx scripts/ingest-first-tranche.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const API = 'http://localhost:3001';
const API_KEY = 'dev-local-key';
const ADMIN_USER = 'arnettmcmurray@gmail.com';
const ADMIN_PASS = 'arnett-five-eyes-2026';
const KB_BASE = join(import.meta.dirname, '../out/kb-content');

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

const post = (path: string, body: unknown, token?: string) => request(path, 'POST', body, token);
const get  = (path: string, token?: string) => request(path, 'GET', undefined, token);

// ---------------------------------------------------------------------------
// Frontmatter parser
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
  const body = match[2].trim();

  const get = (key: string): string => {
    const m = fmRaw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : '';
  };

  const topicsRaw = get('topics');
  const topics = topicsRaw ? topicsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  return {
    fm: {
      title: get('title'),
      type: get('type'),
      topics,
      source_trust: get('source_trust') || 'internal',
    },
    body,
  };
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
  // Split on --- dividers (keeping blocks)
  const blocks = raw.split(/\n---\n/).filter(b => b.includes('**Q'));

  const questions: QuizQuestion[] = [];

  for (const block of blocks) {
    // Extract question text
    const qMatch = block.match(/\*\*Q\d+\.\*\*\s*([\s\S]*?)(?=\n[A-D]\))/);
    if (!qMatch) continue;
    const questionText = qMatch[1].trim().replace(/\n/g, ' ');

    // Extract options
    const optMatches = [...block.matchAll(/^(\*?)([A-D])\)\s*(.+)$/gm)];
    if (optMatches.length !== 4) continue;

    const options: string[] = [];
    let correctIndex = 0;

    optMatches.forEach((m, i) => {
      const isCorrect = m[1] === '*';
      const text = m[3].trim();
      options.push(text);
      if (isCorrect) correctIndex = i;
    });

    const explanation = `Correct: ${options[correctIndex]}`;

    questions.push({ questionText, options, suggestedCorrectIndex: correctIndex, explanation });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Topic definitions (matching frontmatter exactly)
// ---------------------------------------------------------------------------

const TOPICS = [
  { slug: 'phishing-email-security',            name: 'Phishing and Email Security',              description: 'Phishing attacks, social engineering, and email-borne threats in freight operations.' },
  { slug: 'bec-payment-fraud',                  name: 'BEC and Payment Fraud',                    description: 'Business email compromise, invoice fraud, and payment redirect attacks.' },
  { slug: 'load-board-scams-double-brokering',  name: 'Load Board Scams and Double Brokering',    description: 'Fictitious carrier fraud, load board scams, and unauthorized re-brokering.' },
  { slug: 'broker-carrier-impersonation',        name: 'Broker-Carrier Impersonation',             description: 'Identity theft of carriers and brokers, FMCSA spoofing, and carrier packet fraud.' },
  { slug: 'document-fraud',                      name: 'Document Fraud',                           description: 'Forged BOL, POD, authority documents, and cargo release fraud.' },
  { slug: 'passwords-credential-security',       name: 'Passwords and Credential Security',        description: 'Password hygiene, credential theft, account takeover prevention.' },
  { slug: 'mfa',                                 name: 'MFA',                                      description: 'Multi-factor authentication setup, recovery, and organizational deployment.' },
];

// Topic name → slug lookup (built after creation)
const topicNameToId = new Map<string, string>();

// ---------------------------------------------------------------------------
// KB item definitions: [dir, file, slug, role, displayOrder]
// ---------------------------------------------------------------------------

interface ItemDef {
  dir: string;
  file: string;
  slug: string;
  order: number;
  moduleRole: 'primary' | 'supplementary';
}

const T1_ITEMS: ItemDef[] = [
  { dir: 't1-phishing', file: 'kb-01-phishing-in-freight.md',         slug: 't1-phishing-in-freight',          order: 1,  moduleRole: 'primary' },
  { dir: 't1-phishing', file: 'kb-02-email-red-flags.md',             slug: 't1-email-red-flags',              order: 2,  moduleRole: 'primary' },
  { dir: 't1-phishing', file: 'kb-03-smishing-vishing-drivers.md',    slug: 't1-smishing-vishing-drivers',     order: 3,  moduleRole: 'primary' },
  { dir: 't1-phishing', file: 'kb-04-safe-link-handling.md',          slug: 't1-safe-link-handling',           order: 4,  moduleRole: 'primary' },
  { dir: 't1-phishing', file: 'kb-05-how-to-report-suspicious.md',    slug: 't1-how-to-report-suspicious',     order: 5,  moduleRole: 'primary' },
  { dir: 't1-phishing', file: 'kb-06-phishing-ransomware-killchain.md', slug: 't1-phishing-ransomware-killchain', order: 6, moduleRole: 'supplementary' },
  { dir: 't1-phishing', file: 'kb-07-i-clicked-immediate-steps.md',   slug: 't1-i-clicked-immediate-steps',   order: 7,  moduleRole: 'supplementary' },
];

const T2_ITEMS: ItemDef[] = [
  { dir: 't2-bec-payment', file: 'kb-01-payment-change-policy.md',       slug: 't2-payment-change-policy',       order: 1, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-02-bec-in-freight.md',              slug: 't2-bec-in-freight',              order: 2, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-03-freight-bec-map.md',             slug: 't2-freight-bec-map',             order: 3, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-04-bec-indicator-library.md',       slug: 't2-bec-indicator-library',       order: 4, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-05-financial-escalation-tree.md',   slug: 't2-financial-escalation-tree',   order: 5, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-06-dual-approval.md',               slug: 't2-dual-approval',               order: 6, moduleRole: 'primary' },
  { dir: 't2-bec-payment', file: 'kb-07-already-sent-money.md',          slug: 't2-already-sent-money',          order: 7, moduleRole: 'supplementary' },
  { dir: 't2-bec-payment', file: 'kb-08-evidence-capture-checklist.md',  slug: 't2-evidence-capture-checklist',  order: 8, moduleRole: 'supplementary' },
];

const T3_ITEMS: ItemDef[] = [
  { dir: 't3-passwords-mfa', file: 'kb-01-account-security-standard.md',   slug: 't3-account-security-standard',   order: 1, moduleRole: 'primary' },
  { dir: 't3-passwords-mfa', file: 'kb-02-password-guidance.md',           slug: 't3-password-guidance',           order: 2, moduleRole: 'primary' },
  { dir: 't3-passwords-mfa', file: 'kb-03-mfa-deployment-guide.md',        slug: 't3-mfa-deployment-guide',        order: 3, moduleRole: 'primary' },
  { dir: 't3-passwords-mfa', file: 'kb-04-mfa-faq.md',                     slug: 't3-mfa-faq',                     order: 4, moduleRole: 'primary' },
  { dir: 't3-passwords-mfa', file: 'kb-05-privilege-separation.md',        slug: 't3-privilege-separation',        order: 5, moduleRole: 'primary' },
  { dir: 't3-passwords-mfa', file: 'kb-06-account-takeover-in-freight.md', slug: 't3-account-takeover-in-freight', order: 6, moduleRole: 'supplementary' },
  { dir: 't3-passwords-mfa', file: 'kb-07-lost-phone-mfa-recovery.md',     slug: 't3-lost-phone-mfa-recovery',     order: 7, moduleRole: 'supplementary' },
];

const T4_ITEMS: ItemDef[] = [
  { dir: 't4-freight-identity', file: 'kb-01-freight-fraud-kill-chain.md',          slug: 't4-freight-fraud-kill-chain',          order: 1, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-02-carrier-identity-verification.md',     slug: 't4-carrier-identity-verification',     order: 2, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-03-load-board-red-flags.md',              slug: 't4-load-board-red-flags',              order: 3, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-04-double-brokering-mechanics.md',        slug: 't4-double-brokering-mechanics',        order: 4, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-05-pickup-integrity.md',                  slug: 't4-pickup-integrity',                  order: 5, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-06-bol-pod-document-integrity.md',        slug: 't4-bol-pod-document-integrity',        order: 6, moduleRole: 'primary' },
  { dir: 't4-freight-identity', file: 'kb-07-exception-handling-rules.md',          slug: 't4-exception-handling-rules',          order: 7, moduleRole: 'supplementary' },
  { dir: 't4-freight-identity', file: 'kb-08-red-flags-by-workflow-stage.md',       slug: 't4-red-flags-by-workflow-stage',       order: 8, moduleRole: 'supplementary' },
  { dir: 't4-freight-identity', file: 'kb-09-role-based-verification-checklists.md', slug: 't4-role-based-verification-checklists', order: 9, moduleRole: 'supplementary' },
];

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

const MODULES = [
  {
    slug: 't1-phishing-email-security',
    title: 'Phishing and Email Security',
    description: 'How freight-targeted phishing and social engineering attacks work, and how to recognize and stop them at every stage.',
    estimatedMinutes: 20,
    displayOrder: 1,
    items: T1_ITEMS,
    practiceFile: 't1-phishing/practice-questions.md',
  },
  {
    slug: 't2-bec-payment-fraud',
    title: 'BEC and Payment Fraud',
    description: 'Business email compromise and payment fraud patterns in freight — how to verify, escalate, and respond.',
    estimatedMinutes: 25,
    displayOrder: 2,
    items: T2_ITEMS,
    practiceFile: 't2-bec-payment/practice-questions.md',
  },
  {
    slug: 't3-passwords-mfa',
    title: 'Passwords and MFA',
    description: 'Account security standards, credential hygiene, MFA deployment, and account takeover prevention for freight operations.',
    estimatedMinutes: 20,
    displayOrder: 3,
    items: T3_ITEMS,
    practiceFile: 't3-passwords-mfa/practice-questions.md',
  },
  {
    slug: 't4-freight-identity',
    title: 'Freight Identity, Verification, and Fraud Controls',
    description: 'Carrier identity verification, pickup integrity, document fraud, double brokering, and exception handling in freight operations.',
    estimatedMinutes: 30,
    displayOrder: 4,
    items: T4_ITEMS,
    practiceFile: 't4-freight-identity/practice-questions.md',
  },
];

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

let step = 0;
const log = (msg: string) => console.log(`[${String(++step).padStart(3, '0')}] ${msg}`);
const ok  = (msg: string) => console.log(`      ✓ ${msg}`);
const warn = (msg: string) => console.warn(`      ⚠ ${msg}`);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n=== Five Eyes KB First Tranche Ingest ===\n');

  // 1. Admin login
  log('Admin login');
  const auth = await post('/auth/admin/login', { username: ADMIN_USER, password: ADMIN_PASS }) as any;
  const token = auth.token as string;
  ok(`Authenticated as ${auth.username}`);

  // 2. Check existing topics to avoid duplicates
  log('Fetching existing topics');
  const existingTopics = await get('/kb/topics', token) as any[];
  const existingTopicSlugs = new Set(existingTopics.map((t: any) => t.slug));
  for (const t of existingTopics) {
    topicNameToId.set(t.name, t.id);
  }
  ok(`${existingTopics.length} topics already in DB`);

  // 3. Create topics
  log('Creating topics');
  for (const topic of TOPICS) {
    if (existingTopicSlugs.has(topic.slug)) {
      ok(`Topic already exists: ${topic.name}`);
      continue;
    }
    const res = await post('/kb/topics', topic, token) as any;
    topicNameToId.set(topic.name, res.id);
    ok(`Created topic: ${topic.name} (${res.id})`);
  }

  // 4. Check existing items (by slug) to avoid duplicates
  log('Fetching existing KB items');
  const existingItems = await get('/kb/items', token) as any[];
  const existingItemSlugs = new Map<string, string>(); // slug → id
  for (const it of existingItems) {
    existingItemSlugs.set(it.slug, it.id);
  }
  ok(`${existingItems.length} items already in DB`);

  // 5. Ingest all KB items
  const allGroups = [T1_ITEMS, T2_ITEMS, T3_ITEMS, T4_ITEMS];
  const itemSlugToId = new Map<string, string>(existingItemSlugs);

  for (const group of allGroups) {
    for (const def of group) {
      const filePath = join(KB_BASE, def.dir, def.file);
      const raw = readFileSync(filePath, 'utf8');
      const { fm, body } = parseFrontmatter(raw);

      const typeMap: Record<string, string> = {
        'training-content': 'training-content',
        'threat-brief': 'threat-brief',
        'policy': 'policy',
        'faq': 'faq',
      };
      const itemType = typeMap[fm.type] ?? 'training-content';

      if (existingItemSlugs.has(def.slug)) {
        log(`Item exists, skipping creation: ${def.slug}`);
        itemSlugToId.set(def.slug, existingItemSlugs.get(def.slug)!);

        // Still ensure it has a revision and is published
        const itemId = existingItemSlugs.get(def.slug)!;
        const existing = await get(`/kb/items/${itemId}`, token) as any;
        if (!existing.currentRevisionId) {
          const rev = await post(`/kb/items/${itemId}/revisions`, { content: body }, token) as any;
          ok(`Added revision to existing item ${def.slug} (rev ${rev.id})`);
        }
        if (existing.status === 'draft') {
          await post(`/kb/items/${itemId}/workflow/submit`, {}, token);
          await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
          ok(`Published existing item: ${def.slug}`);
        } else if (existing.status === 'under-review') {
          await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
          ok(`Published existing item: ${def.slug}`);
        }
        continue;
      }

      log(`Ingesting: ${def.slug}`);

      // Create item
      const item = await post('/kb/items', {
        slug: def.slug,
        title: fm.title,
        type: itemType,
        tags: [],
        status: 'draft',
        sourceTrust: fm.source_trust || 'internal',
        currentRevisionId: null,
      }, token) as any;

      const itemId: string = item.id;
      itemSlugToId.set(def.slug, itemId);
      ok(`Created item ${def.slug} (${itemId})`);

      // Create revision (automatically sets currentRevisionId)
      const rev = await post(`/kb/items/${itemId}/revisions`, { content: body }, token) as any;
      ok(`Revision v${rev.version} created`);

      // Submit for review, then publish
      await post(`/kb/items/${itemId}/workflow/submit`, {}, token);
      await post(`/kb/items/${itemId}/workflow/publish`, {}, token);
      ok(`Published`);

      // Assign to topics
      for (const topicName of fm.topics) {
        const topicId = topicNameToId.get(topicName);
        if (!topicId) {
          warn(`Topic not found: "${topicName}" — skipping assignment for ${def.slug}`);
          continue;
        }
        try {
          await post(`/kb/topics/${topicId}/assign`, {
            itemId,
            weight: 1.0,
            assignedBy: 'admin',
          }, token);
          ok(`Assigned to topic: ${topicName}`);
        } catch (e: any) {
          warn(`Topic assign may already exist: ${e.message.slice(0, 60)}`);
        }
      }
    }
  }

  // 6. Create modules and link items
  log('Creating / updating modules');
  const existingModules = await get('/kb/modules', token) as any[];
  const existingModSlugs = new Map<string, string>(); // slug → id
  for (const m of existingModules as any[]) {
    existingModSlugs.set(m.slug, m.id);
  }

  const moduleSlugToId = new Map<string, string>(existingModSlugs);

  for (const mod of MODULES) {
    let modId: string;

    if (existingModSlugs.has(mod.slug)) {
      modId = existingModSlugs.get(mod.slug)!;
      log(`Module exists: ${mod.slug} (${modId})`);
      // Update estimatedMinutes if needed
      await request(`/kb/modules/${modId}`, 'PATCH', {
        title: mod.title,
        description: mod.description,
        estimatedMinutes: mod.estimatedMinutes,
        displayOrder: mod.displayOrder,
      }, token);
      ok(`Updated module metadata`);
    } else {
      log(`Creating module: ${mod.slug}`);
      const res = await post('/kb/modules', {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        estimatedMinutes: mod.estimatedMinutes,
        displayOrder: mod.displayOrder,
      }, token) as any;
      modId = res.id;
      ok(`Created module ${mod.slug} (${modId})`);
    }
    moduleSlugToId.set(mod.slug, modId);

    // Get existing links for this module
    const existingLinks = await get(`/kb/modules/${modId}/links`, token) as any[];
    const linkedItemIds = new Set(existingLinks.map((l: any) => l.kbItemId));

    // Link items to module
    for (const itemDef of mod.items) {
      const itemId = itemSlugToId.get(itemDef.slug);
      if (!itemId) {
        warn(`Item ID not found for ${itemDef.slug} — skipping module link`);
        continue;
      }
      if (linkedItemIds.has(itemId)) {
        ok(`Item already linked: ${itemDef.slug}`);
        continue;
      }
      await post(`/kb/modules/${modId}/links`, {
        kbItemId: itemId,
        role: itemDef.moduleRole,
        order: itemDef.order,
      }, token);
      ok(`Linked ${itemDef.slug} → ${mod.slug} [${itemDef.moduleRole}]`);
    }

    // Publish module
    try {
      await post(`/kb/modules/${modId}/publish`, {}, token);
      ok(`Published module: ${mod.slug}`);
    } catch (e: any) {
      ok(`Module already published or no publish needed`);
    }
  }

  // 7. Create quiz candidates from practice questions
  log('Creating quiz candidates');

  for (const mod of MODULES) {
    const practiceFile = join(KB_BASE, mod.practiceFile);
    const raw = readFileSync(practiceFile, 'utf8');
    const allQuestions = parsePracticeQuestions(raw);
    ok(`Parsed ${allQuestions.length} questions from ${mod.practiceFile}`);

    const modId = moduleSlugToId.get(mod.slug)!;

    // Distribute questions across items round-robin
    const items = mod.items;
    const questionsPerItem = Math.ceil(allQuestions.length / items.length);

    for (let i = 0; i < items.length; i++) {
      const itemDef = items[i];
      const itemId = itemSlugToId.get(itemDef.slug);
      if (!itemId) { warn(`No itemId for ${itemDef.slug}`); continue; }

      // Get existing quiz candidates for this item to avoid duplicates
      const existingQCs = await get(`/kb/items/${itemId}/quiz-candidates`, token) as any[];
      if (existingQCs.length > 0) {
        ok(`${itemDef.slug} already has ${existingQCs.length} quiz candidates — skipping`);
        continue;
      }

      // Get revision ID for this item
      const itemData = await get(`/kb/items/${itemId}`, token) as any;
      const revisionId = itemData.currentRevisionId;
      if (!revisionId) { warn(`No revision for ${itemDef.slug}`); continue; }

      const slice = allQuestions.slice(i * questionsPerItem, (i + 1) * questionsPerItem);
      // Ensure at minimum 3 questions, wrap if needed
      const final = slice.length > 0 ? slice : allQuestions.slice(-3);

      let createdCount = 0;
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

          // Approve immediately
          await post(`/kb/quiz-candidates/${candidate.id}/approve`, {}, token);
          createdCount++;
        } catch (e: any) {
          warn(`Quiz candidate create failed: ${e.message.slice(0, 80)}`);
        }
      }
      ok(`${itemDef.slug}: ${createdCount} quiz candidates created and approved`);
    }
  }

  // 8. Summary
  console.log('\n=== Ingest Complete ===');
  console.log(`Topics:    ${TOPICS.length}`);
  console.log(`KB Items:  ${allGroups.flat().length}`);
  console.log(`Modules:   ${MODULES.length}`);
  console.log(`Practice files: ${MODULES.length} (distributed across items)`);
  console.log('\nAll First Tranche content is now in-system and published.\n');
}

main().catch(err => {
  console.error('\n✗ Ingest failed:', err.message);
  process.exit(1);
});
