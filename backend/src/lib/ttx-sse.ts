import type { Response } from 'express';

interface SseClient {
  sessionId: string;
  res: Response;
}

const clients: SseClient[] = [];

export function addClient(sessionId: string, res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push({ sessionId, res });

  res.on('close', () => removeClient(res));
}

export function removeClient(res: Response): void {
  const idx = clients.findIndex(c => c.res === res);
  if (idx !== -1) clients.splice(idx, 1);
}

export function broadcast(sessionId: string, data: unknown): void {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    if (client.sessionId === sessionId) {
      try {
        client.res.write(payload);
      } catch {
        removeClient(client.res);
      }
    }
  }
}
