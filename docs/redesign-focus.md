# Redesign Focus

These areas are being reworked from scratch in v2.

---

## 1. Module / Learning Structure

### What was wrong in v1
- `TrainingModules.tsx` pulls modules from an API but the KB has no real module content
- `ModuleDetail.tsx` exists but the content pipeline behind it is empty
- No defined module taxonomy — no categories, no sequencing, no prerequisites
- Status tracking (not_started / in_progress / completed) exists in the UI but has no reliable backend source of truth

### What v2 needs
- A clean module schema: id, slug, title, category, difficulty, content_source, prerequisites
- A defined learning path — sequenced modules per track (e.g., phishing awareness → ransomware → supply chain threat intel)
- Module content backed by real KB articles, not placeholder API calls
- Progress tracking tied to the KB article a module is derived from

---

## 2. Knowledge Base Setup

### What was wrong in v1
- `KnowledgeBase.ts` is an in-memory class using fake cosine similarity with no real embeddings
- `kb/active/` contains only a README — no actual content
- The KB is a structural placeholder; the AI was filling the gap left by the missing content
- No real ingestion pipeline connected to the frontend KB class

### What v2 needs
- Real KB articles in `kb/active/` — markdown files covering cyber threats relevant to logistics/supply chain
- A proper backend ingestion pipeline: parse → chunk → embed → store in Postgres (`kb_items`, `kb_revisions`)
- KB search backed by real vector similarity (pgvector or equivalent)
- A clear content governance process: draft → review → publish

---

## 3. Retrieval / RAG Flow

### What was wrong in v1
- The "RAG" flow was frontend-only — no real retrieval, no embeddings, no database
- `AIAssistant.ts` routes to KB first, but since KB has no content, it always falls through to OpenAI
- The effect: every query went to AI, making the product AI-first despite the intent to be KB-first
- The `FloatingChatButton` (Oracle Chat) on every page reinforced the AI-first perception

### What v2 needs
- Retrieval runs server-side against real embedded documents
- Confidence gating is real: KB answers when confident, AI is called only when KB cannot answer
- The retrieval API returns: answer, confidence score, source article references
- No floating AI chat widget on every page — AI access is contextual and intentional

---

## 4. AI Usage Boundaries

### What was wrong in v1
- `AIAssistant.ts` was effectively the primary system because the KB was empty
- `GameAIAdapter.ts` — AI powering a security game adds complexity without clear training value
- `OracleChatPage` — a full-page AI chat interface positioned as a core feature
- AI was present in: training, games, chat, tabletop, scorecard — everywhere
- No explicit rule about when AI is allowed vs. when it must defer to KB

### What v2 needs
- AI is allowed in four bounded cases only:
  1. Synthesis across multiple KB items (multi-source summaries)
  2. Explanation of dense material (when KB article is retrieved but needs unpacking)
  3. Controlled scenario generation / inject creation (TTX only, admin-triggered)
  4. Edge cases where KB retrieval confidence is below threshold
- AI is not the default answer mechanism
- No AI in navigation, dashboards, landing pages, or public-facing flows
- Every AI call must be logged and auditable
