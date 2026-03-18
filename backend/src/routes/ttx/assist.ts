import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { Request } from 'express';

function extractError(e: unknown): string {
  if (e instanceof Anthropic.APIError) {
    // Pull inner message from Anthropic error body if available
    const body = e.error as { error?: { message?: string } } | undefined;
    return body?.error?.message ?? e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

type AdminReq = Request & { adminUsername: string };

function logAssist(adminUsername: string, endpoint: string, input: Record<string, unknown>) {
  console.log(`[ttx-assist] ${new Date().toISOString()} admin=${adminUsername} endpoint=${endpoint} input=${JSON.stringify(input)}`);
}

const router = Router();

function getClient() {
  const key = process.env['ANTHROPIC_API_KEY'];
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set in backend/.env');
  return new Anthropic({ apiKey: key });
}

// POST /ttx/assist/scenario
// Body: { title: string, objective: string }
// Returns: { sections: Array<{ title, steps: Array<{ prompt, facilitatorNotes, injects: Array<{ body, injectType, targetRoles, suggestedTimingMinutes }> }> }> }
router.post('/scenario', async (req, res) => {
  const { title, objective } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  if (!title || !objective) {
    res.status(400).json({ error: 'title and objective are required' });
    return;
  }
  logAssist(adminUsername, 'scenario', { title, objective });

  const prompt = `You are a tabletop exercise (TTX) designer for cybersecurity and organizational resilience training.

Given the following scenario title and objective, generate a structured TTX scenario with 3-5 sections, each containing 2-4 steps, each step containing 1-3 injects.

Title: ${title}
Objective: ${objective}

Return ONLY valid JSON in this exact shape:
{
  "sections": [
    {
      "title": "Section title",
      "steps": [
        {
          "prompt": "Discussion prompt for facilitator",
          "facilitatorNotes": "Optional background or facilitator guidance",
          "injects": [
            {
              "body": "The inject message delivered to participants",
              "injectType": "technical|legal|media|customer|other",
              "targetRoles": ["CISO", "Legal"],
              "suggestedTimingMinutes": 10
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- injectType must be one of: technical, legal, media, customer, other
- targetRoles is an array of role strings (can be empty [])
- suggestedTimingMinutes is a number (minutes) or null
- Make injects realistic, concrete, and progressively escalating
- facilitatorNotes should help the facilitator guide discussion, not repeat the inject
- Return only the JSON, no prose`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.find(b => b.type === 'text')?.text ?? '';
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    let draft: unknown;
    try {
      draft = JSON.parse(json);
    } catch {
      res.status(500).json({ error: 'AI returned unparseable response — try again' });
      return;
    }
    if (!draft || typeof draft !== 'object' || !Array.isArray((draft as Record<string, unknown>)['sections'])) {
      res.status(500).json({ error: 'AI response missing expected sections array — try again' });
      return;
    }
    res.json(draft);
  } catch (e) {
    res.status(500).json({ error: extractError(e) });
  }
});

// POST /ttx/assist/injects
// Body: { stepPrompt: string, scenarioContext?: string, count?: number }
// Returns: { injects: Array<{ body, injectType, targetRoles, suggestedTimingMinutes }> }
router.post('/injects', async (req, res) => {
  const { stepPrompt, scenarioContext, count = 3 } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  if (!stepPrompt) {
    res.status(400).json({ error: 'stepPrompt is required' });
    return;
  }
  logAssist(adminUsername, 'injects', { stepPrompt: stepPrompt.slice(0, 100), count });

  const prompt = `You are a tabletop exercise (TTX) designer. Generate ${count} realistic inject options for the following discussion step.

Step prompt: ${stepPrompt}
${scenarioContext ? `Scenario context: ${scenarioContext}` : ''}

Return ONLY valid JSON in this shape:
{
  "injects": [
    {
      "body": "The inject message delivered to participants",
      "injectType": "technical|legal|media|customer|other",
      "targetRoles": ["CISO"],
      "suggestedTimingMinutes": 10
    }
  ]
}

Rules:
- injectType must be one of: technical, legal, media, customer, other
- targetRoles is an array (can be empty [])
- suggestedTimingMinutes is a number or null
- Each inject should be distinct in type, angle, or severity
- Keep inject body concise and actionable (1-3 sentences)
- Return only the JSON, no prose`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.find(b => b.type === 'text')?.text ?? '';
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    let draft: unknown;
    try {
      draft = JSON.parse(json);
    } catch {
      res.status(500).json({ error: 'AI returned unparseable response — try again' });
      return;
    }
    if (!draft || typeof draft !== 'object' || !Array.isArray((draft as Record<string, unknown>)['injects'])) {
      res.status(500).json({ error: 'AI response missing expected injects array — try again' });
      return;
    }
    res.json(draft);
  } catch (e) {
    res.status(500).json({ error: extractError(e) });
  }
});

export default router;
