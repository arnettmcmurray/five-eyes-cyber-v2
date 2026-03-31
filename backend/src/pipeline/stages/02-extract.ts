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
  // Use the mimeType detected at read time (may differ from source.mimeType for url-fetch)
  const effectiveMime = sourceResult.mimeType || source.mimeType;
  let htmlTitle: string | undefined;
  if (effectiveMime === 'text/html') {
    // Extract <title> tag content before stripping — used as inferred title later
    const htmlTitleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    htmlTitle = htmlTitleMatch ? htmlTitleMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

    // Remove scripts/styles entirely
    text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    // Strip remaining tags
    text = text.replace(/<[^>]+>/g, ' ');
    // Decode common HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—');
    text = text.replace(/\s{2,}/g, ' ').trim();
  } else if (effectiveMime === 'application/pdf') {
    // rawContent is pre-extracted text from pdf-parse in the ingestion service — pass through
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

  // Infer title: for HTML use the <title> tag if available, then headings, then first section line
  const firstHeadingSection = sections.find((s) => s.heading !== undefined);
  const inferredTitle =
    (effectiveMime === 'text/html' ? htmlTitle : undefined) ??
    firstHeadingSection?.heading ??
    sections[0]?.body.split('\n')[0] ??
    source.label;

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
