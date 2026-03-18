# Gate 5 — Critical-Path Smoke Tests (2026-03-16)

All tests run against live stack: backend :3001, DB :5433, API key dev-local-key.

## Admin Auth

| Test | Result |
|------|--------|
| POST /auth/admin/login { username, password } → token | ✓ |
| Admin token → GET /admin/access (protected route) | ✓ 200 |
| Learner token → GET /admin/access → 401 | ✓ |
| Wrong password → 401 | ✓ |
| Change-password + re-login | ✓ (verified in Batch 26) |
| POST /admin/profile/logout invalidates session | ✓ (verified in Batch 26) |

## Learner Auth

| Test | Result |
|------|--------|
| POST /auth/otp/request { handle } → 204 | ✓ |
| Rate limiter fires after 10 req/15min | ✓ (429 with correct JSON error) |
| POST /auth/otp/verify { handle, code } → { token, learnerId } | ✓ (verified via DB direct) |
| Bearer token → GET /access/tier → { tier, learnerId } | ✓ |

## Paid/Free Access Gating

| Test | Result |
|------|--------|
| Free learner → GET /learn/modules → 403 with tier:free | ✓ |
| Admin grants paid override (grantedBy from token ✓) | ✓ |
| Tier immediately reflects paid after override | ✓ |
| GET /learn/modules with paid tier → list of modules | ✓ (2 modules returned) |
| Admin revokes override via DELETE /admin/access/:learnerId | ✓ 204 |
| Tier reverts to free after revoke | ✓ |

**Note:** DELETE /admin/access/:learnerId uses learnerId path param (not override UUID).

## Learner Learning Flow

| Test | Result |
|------|--------|
| GET /learn/modules → { modules: [...], nextRecommendedId } | ✓ |
| GET /learn/modules/:id → { module, studyItems, practiceQuestions } | ✓ |
| POST /learn/modules/:id/practice → { score, total, results } | ✓ |
| Admin sees progress at GET /admin/progress?moduleId=... | ✓ (1 row returned) |

## KB Admin

| Test | Result |
|------|--------|
| POST /kb/ingest/manual → job with createdBy from token | ✓ |
| GET /kb/items → list | ✓ |
| GET /kb/search?q=... → results | ✓ (0 results for unpublished content — expected) |

## TTX

| Test | Result |
|------|--------|
| GET /ttx/scenarios (admin) → list | ✓ |
| POST /ttx/scenarios { slug, title, objective } → created | ✓ |
| Learner token → GET /ttx/scenarios → 401 | ✓ |
| POST /ttx/sessions { scenarioId, title } → planned session | ✓ |
| GET /ttx/sessions → list | ✓ |

## AI Assist

| Test | Result |
|------|--------|
| Learner token → POST /ttx/assist/scenario → 401 | ✓ |
| Admin POST /ttx/assist/scenario → Anthropic error (credits) not 500 | ✓ (passthrough working) |

## Security

| Test | Result |
|------|--------|
| No API key → 401 | ✓ |
| Wrong API key → 401 | ✓ |
| Admin route without Bearer → 401 | ✓ |
| Body > 100kb → **413** (fixed in Gate 5) | ✓ |
| Health endpoint → 200 ok db:ok | ✓ |

## Bug Fixed in Gate 5

**413 body-too-large exposed as 500:** Global error handler was not checking `err.status`/`err.statusCode`. Express body-parser throws with `status: 413`. Fixed by checking these fields before falling through to 500.

## All 4 Admin Accounts

Passwords set individually (see out/admin-credentials.md). All verified with fresh login.
