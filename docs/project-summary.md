# Project Summary: Five Eyes Dashboard v2

## What This Is

Five Eyes is a cybersecurity training platform built for logistics and supply chain firms. It is operated by former FBI and military intelligence professionals. The product gives logistics organizations access to intelligence-grade training, threat awareness, and incident readiness — capabilities previously available only to governments and large enterprises.

---

## What v2 Preserves

The public-facing and business side of the product is strong and should carry forward without major changes:

- The brand identity (dark/gold, military aesthetic, intelligence-grade tone)
- The positioning (FBI/military background, logistics/supply chain focus)
- The landing page structure and hero messaging
- The capabilities framing (freight security, cyber resilience training, strategic threat intel, incident response)
- The enterprise contact flow
- The tier model concept (free, individual, premium, supervisor, admin)
- Legal pages and the public email health check tool
- The data model for users, KB articles, event logs, and readiness scoring

---

## What v2 Redesigns

The training and intelligence core is being rebuilt:

- **Modules** — real sequenced learning tracks backed by real content, not API placeholders
- **Knowledge Base** — real articles, real ingestion pipeline, real vector search
- **Retrieval flow** — server-side RAG with genuine confidence gating, not a frontend facade
- **AI boundaries** — AI is a minimal backup layer for four specific cases only; it is not the default system

---

## The Core Product Rule

**The Knowledge Base is the primary source of truth.**

When a user asks a question or works through a module, the KB answers first. AI is called only when the KB cannot produce a confident answer. AI is never the first stop.

This is not an AI-first product. It is a knowledge-first product that uses AI as a fallback for genuinely complex retrieval cases.

---

## What That Means in Practice

| Scenario | v1 Behavior | v2 Behavior |
|---|---|---|
| User asks a training question | Falls through to OpenAI (KB is empty) | KB retrieves article, returns answer directly |
| User reaches confidence threshold edge case | AI answers by default | AI is called only after KB returns low confidence |
| User opens any page | Floating Oracle Chat button visible everywhere | AI access is contextual, not ambient |
| Admin creates a TTX scenario | AI generates inject freely | AI generates inject within admin-controlled bounds |
| Module content is missing | API returns empty, UI shows blank | Blocked — no module ships without KB article behind it |

---

## One-Sentence Direction

Preserve the strong public-facing and business identity; rebuild the training and intelligence engine with the Knowledge Base at the center and AI limited to specific, bounded backup cases.
