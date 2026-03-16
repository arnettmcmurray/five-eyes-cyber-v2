import type { RawSource } from '../../models/kb/source.js';

export interface ReadSourceResult {
  sourceId: string;
  content: string;
  mimeType: string;
  byteSize: number;
  readAt: string;
}

export async function readSource(source: RawSource): Promise<ReadSourceResult> {
  let content: string;
  let mimeType = source.mimeType;

  if (source.type === 'url-fetch') {
    const res = await fetch(source.origin, {
      headers: { 'User-Agent': 'five-eyes-kb-ingestion/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`URL fetch failed: ${res.status} ${res.statusText}`);
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) mimeType = 'text/html';
    else if (contentType.includes('text/markdown')) mimeType = 'text/markdown';
    else mimeType = 'text/plain';
    content = await res.text();
  } else {
    content = source.rawContent;
  }

  return {
    sourceId: source.id,
    content,
    mimeType,
    byteSize: Buffer.byteLength(content, 'utf8'),
    readAt: new Date().toISOString(),
  };
}
