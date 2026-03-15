import type { RawSource } from '../../models/kb/source.js';

/**
 * Reads raw content from a RawSource.
 * - file-upload: reads rawContent string directly.
 * - url-fetch: stub (returns placeholder; URL fetch not yet implemented).
 * - manual-entry: passes through as-is.
 */
export interface ReadSourceResult {
  sourceId: string;
  content: string;
  mimeType: string;
  byteSize: number;
  readAt: string;
}

export function readSource(source: RawSource): ReadSourceResult {
  let content: string;

  if (source.type === 'url-fetch') {
    content = `[URL fetch not yet implemented for origin: ${source.origin}]`;
  } else {
    // 'file-upload' and 'manual-entry' both use rawContent directly
    content = source.rawContent;
  }

  return {
    sourceId: source.id,
    content,
    mimeType: source.mimeType,
    byteSize: source.byteSize,
    readAt: new Date().toISOString(),
  };
}
