# Module Model — Five Eyes Dashboard v2

This document defines the structure, lifecycle, and rules for training modules in v2. All future scaffolding must follow these definitions.

---

## What a Module Is

A module is a structured learning unit on a single cybersecurity topic. It consists of:

1. **Reading phase** — content derived from a linked KB article, rendered as markdown
2. **Assessment phase** — a quiz authored by an admin

A module cannot exist without a KB article behind it. The KB article is the single source of truth for module content.

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `slug` | string (unique, url-safe) | Used in routes and prerequisite references |
| `title` | string | Display name |
| `category` | enum | `phishing` \| `ransomware` \| `supply-chain` \| `compliance` \| `incident-response` \| `physical-security` |
| `difficulty` | enum | `beginner` \| `intermediate` \| `advanced` |
| `kb_article_id` | uuid (FK → `kb_items.id`) | Required. Module is blocked if this is null or points to an unpublished article |
| `estimated_minutes` | integer | Estimated time to complete reading + quiz |
| `status` | enum | `draft` \| `published` \| `archived` |
| `order` | integer | Sequencing position within a track |
| `prerequisites` | string[] | Array of module slugs. Can be empty. |

---

## User Progress States

Each user has one progress state per module.

| State | Meaning |
|-------|---------|
| `not_started` | User has not opened the module |
| `in_progress` | User has started but not completed the quiz |
| `completed` | User has passed the quiz (score ≥ passing threshold) |

---

## Quiz Relationship

- Each module has exactly one quiz (1:1 relationship).
- Quiz structure:
  - `question[]` — array of question objects
  - Each question: `text`, `options[]`, `correct_index`, `explanation`
- Quizzes are authored by admin in `/admin/content`.
- Quiz data is stored in the module record itself — not fetched via a separate retrieval call.
- The passing threshold is a server config value, not hardcoded per module.

---

## Module-to-KB Link

- The content displayed to the user during the reading phase is the KB article body, rendered as markdown.
- The KB article is the **single source of truth** for module content. The module stores no duplicate content.
- If the linked KB article is unpublished, the module is blocked from publishing.
- If the KB article is revised and republished, the module surfaces the new revision automatically — it reads from the current published revision at render time.

---

## Tracks and Sequencing

A **track** is an ordered list of modules for a specific learning goal.

Example tracks:
- Phishing Awareness Track
- Ransomware Readiness Track
- Supply Chain Threat Intel Track

**Sequencing rules:**
- Admin sets `order` and `prerequisites` per module in `/admin/content`.
- A module with prerequisites cannot be started until all prerequisite modules are in `completed` state for that user.
- If a prerequisite slug does not resolve to an existing module, the module is blocked from publishing (see blocking conditions below).

---

## What Blocks a Module from Publishing

All four conditions must be clear for a module to be published. If any condition is true, the module is blocked.

| Condition | Blocked State |
|-----------|--------------|
| `kb_article_id` is null | BLOCKED |
| `kb_article_id` points to an unpublished KB article | BLOCKED |
| Quiz has fewer than 3 questions | BLOCKED |
| Module `status` is not `published` | BLOCKED (module will not appear to users) |
| `prerequisites` array contains a slug that does not match any existing module | BLOCKED |

---

## TTX Relationship

TTX (Tabletop Exercises) are **distinct** from modules. They are not the same system.

| Dimension | Modules | TTX |
|-----------|---------|-----|
| Content source | KB article | Scenario template (narrative + inject set) |
| Gate type | Content-gated (KB required) | Tier-gated (subscription tier) |
| Access path | `/academy` and `/academy/:moduleId` | `/simulations` and `/simulations/:runId` |
| KB dependency | Required | Optional (scenarios may cite KB slugs for reference) |
| Completion tracking | Quiz pass/fail, progress state | After-action review (AAR) |

A user can access TTX without completing related modules. TTX does not appear in `/academy`.
