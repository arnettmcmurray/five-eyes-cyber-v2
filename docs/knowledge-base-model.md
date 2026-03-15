# Knowledge Base Model — Five Eyes Dashboard v2

This document defines the structure, lifecycle, and trust model for KB items in v2. All future scaffolding must follow these definitions.

---

## KB Item Types

| Type | Description |
|------|-------------|
| `training-content` | Primary article type. Used as the content source for training modules. |
| `threat-brief` | Shorter, time-sensitive threat intelligence pieces. |
| `policy` | Organizational policy or compliance reference material. |
| `faq` | Question/answer pair. Used for retrieval responses. |
| `glossary-term` | Single-term definition with optional cross-references. |

---

## Required Metadata (All KB Items)

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `slug` | string (unique, url-safe) | Used in routes and cross-references |
| `title` | string | Display name |
| `type` | enum | One of the five types above |
| `tags` | string[] | Array of strings; enables retrieval filtering |
| `status` | enum | `draft` \| `under-review` \| `published` |
| `source_trust` | enum | `internal` \| `external-curated` \| `raw-upload` |
| `created_by` | uuid (FK → `users`) | Author |
| `current_revision_id` | uuid (FK → `kb_revisions`) | Points to the active published revision |

---

## Revisions and Versioning

Every content change creates a new record in `kb_revisions`. Old revisions are never deleted.

**`kb_revisions` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Revision primary key |
| `item_id` | uuid (FK → `kb_items.id`) | Parent KB item |
| `content` | markdown text | Full article body at this revision |
| `version` | integer | Auto-incremented per item |
| `created_by` | uuid (FK → `users`) | Who authored this revision |
| `created_at` | timestamp | When this revision was created |

**Rules:**
- Publishing a new revision updates `kb_items.current_revision_id` — it does not delete old revisions.
- Admin can roll back to any prior revision by updating `current_revision_id`.
- Audit history is fully preserved.

---

## Lifecycle

```
draft → under-review → published
```

| Status | Visibility | Module Eligibility | Index Eligibility |
|--------|------------|-------------------|-------------------|
| `draft` | Not visible to users | Not eligible | Not indexed |
| `under-review` | Not visible to users | Not eligible | Not indexed |
| `published` | Visible in Knowledge Cabinet | Eligible | Indexed for vector search |

---

## Source Trust Model

| Source Trust | Meaning | Publish Path |
|--------------|---------|-------------|
| `internal` | Authored directly by Five Eyes team | Can be published immediately; highest trust |
| `external-curated` | Sourced from external material (threat feeds, news) and reviewed by team | Must go through `under-review` state before publish |
| `raw-upload` | Raw file uploaded via IntelligenceIngest (drag-and-drop admin tool) | Starts as `draft`; admin must review and rewrite before eligible for `under-review` → `published` |

---

## Admin Content Workflow

1. **Direct authoring** — Admin creates KB item in `/admin/content` via free-text markdown editor. Sets `source_trust: internal`.
2. **Raw file upload** — Admin uploads PDF, text, or HTML via the IntelligenceIngest interface. System creates a `draft` KB item with `source_trust: raw-upload` and the raw content extracted.
3. **Review and reformat** — Admin reviews raw-upload items, rewrites as needed, then transitions: `draft` → `under-review` → `published`.
4. **Audit logging** — All publish actions are logged in `kb_audit_log` with: `admin_id`, `action`, `target_id`, `timestamp`.

---

## How KB Content Supports Other Systems

| System | How KB Is Used |
|--------|---------------|
| **Training modules** | Module reads the `current_revision_id` body at render time. No duplicate content stored in the module. |
| **Knowledge Cabinet (`/cabinet`)** | Displays all `published` KB items. User can search and filter by tag. |
| **Retrieval / RAG** | Published KB items are embedded server-side and indexed for vector search. Unpublished items (`draft`, `under-review`) are excluded from the search index entirely. |
| **TTX scenarios** | Scenario injects may cite KB article slugs as reference material. TTX does not depend on KB content for execution — citation is informational only. |
| **Quiz questions** | Questions are authored by admin in `/admin/content` and stored in the module record. Questions are not directly derived from KB content. Admin writes questions informed by the KB article, but the system does not auto-generate them from it. |

---

## Notes

- A KB item of type `glossary-term` is displayed in the glossary section of `/cabinet` in addition to general search results.
- Tags are free-form strings set by the admin. There is no enforced taxonomy in v2, but consistent tag naming is expected as a convention.
- The `faq` type is the only type where the content body is structurally a Q&A pair rather than a free-form article. Rendering adapts to type at display time.
