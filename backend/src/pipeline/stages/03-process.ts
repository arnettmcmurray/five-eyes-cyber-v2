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

/**
 * Processes ExtractedContent into a ProcessedContent structure ready for admin review.
 * Proposes slug, title, type, tags, and markdown body.
 *
 * In production this would use NLP or an AI call — stub only.
 */
export function processContent(extracted: ExtractedContent, jobId: string): ProcessedContent {
  // Determine proposed title: prefer extracted title, fall back to first section heading
  const proposedTitle =
    extracted.title ??
    extracted.sections.find((s) => s.heading !== undefined)?.heading ??
    'Untitled Content';

  const proposedSlug = slugify(proposedTitle).slice(0, 190);

  // Build markdown body by joining sections
  const markdownBody = extracted.sections
    .map((section) => {
      if (section.heading) {
        return `## ${section.heading}\n\n${section.body}`;
      }
      return section.body;
    })
    .join('\n\n');

  return {
    jobId,
    proposedTitle,
    proposedSlug,
    proposedType: 'training-content',
    proposedTags: [],
    markdownBody,
    qualityScore: 0,
    reviewNotes: ['Automated processing complete. Admin review required before publish.'],
  };
}
