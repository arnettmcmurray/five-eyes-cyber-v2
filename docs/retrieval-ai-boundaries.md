# Retrieval and AI Boundaries — Five Eyes Dashboard v2

This document defines exactly when AI is and is not allowed in v2. These rules are binding. Any feature that calls an AI model must have a named case below that permits it.

---

## Default Path: Direct KB Retrieval

Every user query — in `/cabinet` search, module help, or contextual questions — hits the KB first.

**How it works:**
1. Query is embedded server-side.
2. Embedding is compared against the vector index of all `published` KB items.
3. System returns matched items, confidence score, and source slugs.
4. Response path is determined by confidence (see table below).

**Rule:** Retrieval is server-side only. There is no frontend KB class with fake or client-side embeddings.

---

## Confidence Gating

Threshold values are **server config** — they are not hardcoded in frontend code.

| Confidence Band | Label | Response Action |
|-----------------|-------|----------------|
| ≥ 0.80 | HIGH | Return KB answer directly. **Do not call AI.** |
| ≥ 0.50 and < 0.80 (with matched module) | MEDIUM | Redirect to most relevant module. **Do not call AI.** |
| < 0.50 | LOW | AI fallback — only if AI is permitted on this surface (see below). |

---

## When AI Is Allowed (Four Cases, Exhaustive)

AI may only be called in the following four cases. No other case permits an AI call.

### Case 1: Multi-Source Synthesis
- **Condition:** User query matches multiple KB items, but no single item directly answers it.
- **Action:** AI synthesizes across 2–5 retrieved KB items.
- **Constraint:** AI call is grounded in retrieved KB content only. AI must not use general knowledge outside the retrieved items. Source slugs must be returned with the response.

### Case 2: Dense Material Explanation
- **Condition:** A KB item is retrieved at HIGH confidence (≥ 0.80) AND is marked `difficulty: advanced` AND the user explicitly requests a simpler explanation.
- **Action:** AI rephrases or clarifies the retrieved content at the user's request.
- **Constraint:** AI is not called by default — only on explicit user request. AI must not introduce content beyond the retrieved article.

### Case 3: TTX Inject Generation
- **Condition:** Admin triggers inject generation from a scenario template in `/admin/ttx`.
- **Action:** AI generates scenario injects (prompts/situations) from the template.
- **Constraint:** Admin-triggered only. User-facing only after admin reviews and approves the generated injects. This case is never triggered by user actions.

### Case 4: Below-Threshold Fallback
- **Condition:** Confidence < 0.50 AND no suitable module redirect exists.
- **Action:** AI may answer the query.
- **Constraint:** AI must disclose that no KB match was found. AI must not fabricate sources. The response must include the disclosure: "No matching knowledge base article found — this answer is AI-generated and may be incomplete."

---

## When AI Is Forbidden (Explicit List)

AI calls are **forbidden** on all of the following surfaces and functions. "Forbidden" means no AI model call of any kind — not for summarization, classification, or any other purpose.

| Surface / Function | Reason |
|--------------------|--------|
| Public-facing pages (`/`, `/about`, `/capabilities`, `/enterprise`, `/packages`, `/email-health-check`, `/privacy-policy`, `/terms-conditions`) | No AI calls whatsoever on public pages |
| Navigation and routing decisions | No AI |
| Admin analytics and reporting (`/admin/analytics`) | No AI |
| Supervisor dashboard (`/supervisor`) | No AI |
| Scorecard computation (`/scorecard`) | Scores are computed from structured data, not AI inference |
| Module content display | KB article is rendered directly; AI does not rewrite, summarize, or annotate it by default |
| Quiz question generation | Questions are human-authored; AI does not auto-generate quiz questions |
| Intel Discovery Hub article feed (`/intel`) | Articles are human-curated; AI does not auto-populate the feed |
| Any background / ambient context | No floating AI chat button on every page; no ambient AI assistant in the shell |

---

## Where AI Appears in the Product

AI is surfaced in exactly three places.

| Surface | Cases Permitted | Notes |
|---------|----------------|-------|
| Knowledge Cabinet (`/cabinet`) search | Case 1 (synthesis), Case 4 (fallback) | Contextual — triggered by low/multi-match retrieval results |
| Module detail (`/academy/:moduleId`) | Case 2 (dense explanation) | On explicit user request only; not the default reading experience |
| TTX admin panel (`/admin/ttx`) | Case 3 (inject generation) | Admin-triggered only |

---

## Removal of Ambient AI Patterns

The following v1 patterns are explicitly removed and must not appear in v2:

| Pattern | Action |
|---------|--------|
| `FloatingChatButton` | Removed from `ManagementLayout` |
| `OracleChatPage` | Route `/chat` removed; returns 404 or redirects to `/cabinet` |
| `AITrainingChat` widget | Removed from `ManagementLayout` sidebar |
| `AIContext` provider | May remain for internal use but must not surface AI interaction in the shell UI |

---

## Logging and Audit Requirements

Every AI call must be logged. No exceptions.

**Log entry fields (stored in `event_logs` with `event_type = 'ai_call'`):**

| Field | Description |
|-------|-------------|
| `user_id` | Who triggered the call |
| `surface` | Which page or feature triggered the call (e.g., `cabinet_search`, `module_explanation`, `ttx_inject`, `cabinet_fallback`) |
| `query` | The user's original query text |
| `confidence_at_trigger` | The retrieval confidence score that led to the AI call |
| `response_type` | `synthesis` \| `explanation` \| `inject` \| `fallback` |
| `timestamp` | When the call was made |

**Admin visibility:** AI call logs are viewable in `/admin/analytics`.

**User-facing disclosure for Case 4 (fallback):** The UI must display the following message alongside any below-threshold AI response:

> "No matching knowledge base article found — this answer is AI-generated and may be incomplete."

This disclosure is **required** and must not be suppressed or styled to be non-prominent.
