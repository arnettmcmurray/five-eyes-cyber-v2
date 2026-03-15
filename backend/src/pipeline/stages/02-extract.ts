import type { RawSource, ExtractedContent } from '../../models/kb/source.js';
import type { ReadSourceResult } from './01-read-source.js';

/**
 * Extracts structured text from raw content.
 * - text/plain and text/markdown: minimal cleanup, split on headings/blank lines.
 * - text/html: stub — strips tags, returns plain text.
 * - application/pdf: stub — notes that real extraction requires pdf-parse or similar.
 */
export function extractContent(
  sourceResult: ReadSourceResult,
  source: RawSource,
): ExtractedContent {
  let text = sourceResult.content;

  // Per-MIME pre-processing stubs
  if (source.mimeType === 'text/html') {
    // Stub: strip HTML tags
    text = text.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
  } else if (source.mimeType === 'application/pdf') {
    // Stub: real extraction requires pdf-parse or similar
    text = `[PDF extraction stub — real extraction requires pdf-parse or similar]\n\n${text}`;
  }
  // text/plain and text/markdown pass through as-is

  // Split on double newlines (paragraph/section boundaries)
  const rawSections = text.split(/\n\n+/).filter((s) => s.trim().length > 0);

  const sections: ExtractedContent['sections'] = rawSections.map((body, index) => {
    // Detect a heading: line starting with one or more '#' characters
    const headingMatch = body.match(/^(#{1,6})\s+(.+)/m);
    return {
      heading: headingMatch ? headingMatch[2].trim() : undefined,
      body: body.trim(),
      order: index,
    };
  });

  // Infer title from first heading found, or first section
  const firstHeadingSection = sections.find((s) => s.heading !== undefined);
  const inferredTitle = firstHeadingSection?.heading ?? sections[0]?.body.split('\n')[0] ?? source.label;

  // Estimate word count across all section bodies
  const wordCount = sections.reduce((sum, s) => {
    return sum + s.body.split(/\s+/).filter((w) => w.length > 0).length;
  }, 0);

  return {
    jobId: source.ingestionJobId,
    rawText: text,
    title: inferredTitle,
    detectedLanguage: 'en',
    wordCount,
    sections,
  };
}
