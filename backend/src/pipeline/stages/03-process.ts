import type { ExtractedContent, ProcessedContent } from '../../models/kb/source.js';

/**
 * Converts an extracted title into a URL-safe slug.
 * Lowercases, replaces whitespace and non-alphanumeric chars with hyphens,
 * and collapses consecutive hyphens.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Keywords that signal a specific content type. First match wins.
const TYPE_SIGNALS: Array<{ type: 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term'; keywords: string[] }> = [
  { type: 'policy',        keywords: ['policy', 'procedure', 'compliance', 'regulation', 'gdpr', 'mandate', 'requirement', 'must not', 'prohibited'] },
  { type: 'faq',           keywords: ['faq', 'frequently asked', 'q:', 'q&a', 'question:', 'answer:'] },
  { type: 'glossary-term', keywords: ['glossary', 'definition', 'term:', 'defined as', 'means:'] },
  { type: 'threat-brief',  keywords: ['threat', 'attack', 'adversary', 'malware', 'ransomware', 'phishing', 'bec', 'vulnerability', 'exploit', 'indicator', 'ioc', 'ttps'] },
];

// Tag vocabulary: tag → trigger keywords
const TAG_SIGNALS: Array<{ tag: string; keywords: string[] }> = [
  { tag: 'bec',             keywords: ['bec', 'business email compromise', 'wire fraud', 'invoice fraud', 'payment diversion'] },
  { tag: 'ransomware',      keywords: ['ransomware', 'encryption', 'decryptor', 'ransom note', 'double extortion'] },
  { tag: 'phishing',        keywords: ['phishing', 'spear-phishing', 'credential harvest', 'lookalike domain'] },
  { tag: 'cargo-theft',     keywords: ['cargo theft', 'load board', 'freight fraud', 'double broker', 'carrier identity'] },
  { tag: 'data-breach',     keywords: ['data breach', 'personal data', 'gdpr', 'ico', 'data subject', 'notification'] },
  { tag: 'payment-controls', keywords: ['dual approval', 'two-person', 'out-of-band', 'callback', 'payment authorisation'] },
  { tag: 'incident-response', keywords: ['incident response', 'containment', 'eradication', 'recovery', 'after-action', 'aar'] },
  { tag: 'supply-chain',    keywords: ['supply chain', 'vendor', 'third-party', 'subcontractor', 'procurement'] },
  { tag: 'mfa',             keywords: ['mfa', 'multi-factor', 'two-factor', '2fa', 'authenticator'] },
  { tag: 'freight-security', keywords: ['freight', 'logistics', 'dispatch', 'carrier', 'transport', 'fleet'] },
];

function inferType(text: string): 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term' {
  const lower = text.toLowerCase();
  for (const { type, keywords } of TYPE_SIGNALS) {
    if (keywords.some(k => lower.includes(k))) return type;
  }
  return 'training-content';
}

function inferTags(text: string): string[] {
  const lower = text.toLowerCase();
  return TAG_SIGNALS
    .filter(({ keywords }) => keywords.some(k => lower.includes(k)))
    .map(({ tag }) => tag);
}

function scoreQuality(extracted: ExtractedContent): { score: number; notes: string[] } {
  const notes: string[] = [];
  const totalChars = extracted.sections.reduce((n, s) => n + s.body.length, 0);
  const sectionCount = extracted.sections.length;
  const headingCount = extracted.sections.filter(s => s.heading).length;

  let score = 0;

  if (totalChars >= 2000) score += 40;
  else if (totalChars >= 500) score += 20;
  else notes.push('Content is short (under 500 characters) — review for completeness.');

  if (sectionCount >= 3) score += 20;
  else if (sectionCount >= 1) score += 10;

  if (headingCount >= 2) score += 20;
  else if (headingCount >= 1) score += 10;
  else notes.push('No section headings found — structure may be poor for learner display.');

  if (extracted.title) score += 20;
  else notes.push('No title extracted — a title will need to be set manually before publish.');

  if (notes.length === 0) notes.push('Content structure looks reasonable. Verify type and tags before publish.');

  return { score: Math.min(score, 100), notes };
}

/**
 * Processes ExtractedContent into a ProcessedContent structure ready for admin review.
 * Infers type, tags, and quality score from content keywords and structure.
 */
export function processContent(extracted: ExtractedContent, jobId: string): ProcessedContent {
  const proposedTitle =
    extracted.title ??
    extracted.sections.find((s) => s.heading !== undefined)?.heading ??
    'Untitled Content';

  const proposedSlug = slugify(proposedTitle).slice(0, 190);

  const markdownBody = extracted.sections
    .map((section) => {
      if (section.heading) {
        return `## ${section.heading}\n\n${section.body}`;
      }
      return section.body;
    })
    .join('\n\n');

  const proposedType = inferType(markdownBody + ' ' + proposedTitle);
  const proposedTags = inferTags(markdownBody + ' ' + proposedTitle);
  const { score: qualityScore, notes } = scoreQuality(extracted);

  return {
    jobId,
    proposedTitle,
    proposedSlug,
    proposedType,
    proposedTags,
    markdownBody,
    qualityScore,
    reviewNotes: notes,
  };
}
