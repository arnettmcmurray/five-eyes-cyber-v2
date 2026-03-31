import { Router } from 'express';
import OpenAI from 'openai';
import type { Request } from 'express';

function extractError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

type AdminReq = Request & { adminUsername: string };

function logAssist(adminUsername: string, endpoint: string, input: Record<string, unknown>) {
  console.log(`[ttx-assist] ${new Date().toISOString()} admin=${adminUsername} endpoint=${endpoint} input=${JSON.stringify(input)}`);
}

const router = Router();

function getClient() {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) throw new Error('OPENAI_API_KEY is not set in backend/.env');
  return new OpenAI({ apiKey: key });
}

// POST /ttx/assist/scenario
// Body: { title: string, objective: string }
// Returns: { executiveSummary, goals, targetAudience, signatureTheme, sections: Array<{ title, background, steps: Array<{ title, facilitatorNarrative, participantSituationRoom, prompts, whatGoodLooksLike, consequenceNote, injects: Array<{ content, injectType, targetRoles, consequenceLogic }> }> }> }
router.post('/scenario', async (req, res) => {
  const { title, objective } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  if (!title || !objective) {
    res.status(400).json({ error: 'title and objective are required' });
    return;
  }
  logAssist(adminUsername, 'scenario', { title, objective });

  const prompt = `You are a tabletop exercise (TTX) designer for cybersecurity and organizational resilience training.

Given the following scenario title and objective, generate a structured TTX scenario in the "Executive Standard" format.

Title: ${title}
Objective: ${objective}

Return ONLY valid JSON in this exact shape:
{
  "executiveSummary": "High-level summary for leadership",
  "goals": ["Goal 1", "Goal 2"],
  "targetAudience": ["Role 1", "Role 2"],
  "signatureTheme": "e.g. Physical-Cyber Convergence",
  "sections": [
    {
      "title": "Section title",
      "background": "Context for this phase",
      "steps": [
        {
          "title": "Step title",
          "facilitatorNarrative": "Facilitator-only read-aloud text",
          "participantSituationRoom": "Public narrative feed for learners",
          "prompts": ["Question 1", "Question 2"],
          "whatGoodLooksLike": "Guidance for facilitator on ideal responses",
          "consequenceNote": "Instruction for branching or pacing",
          "injects": [
            {
              "content": "The inject message delivered to participants",
              "injectType": "technical|legal|media|regulatory|other",
              "targetRoles": ["CISO", "Legal"],
              "consequenceLogic": "How this inject changes the scenario landscape"
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- injectType must be one of: technical, legal, media, regulatory, other
- targetRoles is an array of role strings
- Make injects realistic, concrete, and progressively escalating
- facilitatorNarrative should be distinct from the participantSituatonRoom text
- Return only the JSON, no prose`;

  try {
    const client = getClient();
    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.choices[0]?.message?.content ?? '';
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
// Returns: { injects: Array<{ content, injectType, targetRoles, consequenceLogic }> }
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
      "content": "The inject message delivered to participants",
      "injectType": "technical|legal|media|regulatory|other",
      "targetRoles": ["CISO"],
      "consequenceLogic": "How this inject changes the scenario landscape"
    }
  ]
}

Rules:
- injectType must be one of: technical, legal, media, regulatory, other
- targetRoles is an array (can be empty [])
- Each inject should be distinct in type, angle, or severity
- Keep inject content concise and actionable (1-3 sentences)
- Return only the JSON, no prose`;

  try {
    const client = getClient();
    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.choices[0]?.message?.content ?? '';
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
