import type { ProcessedContent } from '../../models/kb/source.js';
import type { ContentChunk } from '../../models/kb/chunk.js';

/** Approximate words-per-chunk target (maps to ~512 tokens). */
const WORDS_PER_CHUNK = 400;

/**
 * Splits ProcessedContent into ContentChunks for embedding.
 * Chunk size approximation: 400 words ≈ 512 tokens.
 * Returns ContentChunk array without embedding/embeddedAt (filled by the embedding stage).
 */
export function chunkContent(
  processed: ProcessedContent,
  itemId: string,
  revisionId: string,
): ContentChunk[] {
  const words = processed.markdownBody.split(/\s+/).filter((w) => w.length > 0);

  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;
  let wordOffset = 0;

  while (wordOffset < words.length) {
    const chunkWords = words.slice(wordOffset, wordOffset + WORDS_PER_CHUNK);
    const content = chunkWords.join(' ');
    const tokenCount = chunkWords.length; // approximation: 1 word ≈ 1 token for stub purposes

    chunks.push({
      id: `chunk-${itemId}-${revisionId}-${chunkIndex}`,
      itemId,
      revisionId,
      chunkIndex,
      content,
      tokenCount,
      // embedding and embeddedAt intentionally absent — filled by embedding stage
    });

    wordOffset += WORDS_PER_CHUNK;
    chunkIndex++;
  }

  // Guarantee at least one chunk even for empty content
  if (chunks.length === 0) {
    chunks.push({
      id: `chunk-${itemId}-${revisionId}-0`,
      itemId,
      revisionId,
      chunkIndex: 0,
      content: '',
      tokenCount: 0,
    });
  }

  return chunks;
}
