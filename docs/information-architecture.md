# Information Architecture — Five Eyes Dashboard v2

This document defines the page map for v2. Every route listed here is binding. Routes listed as removed must not appear in v2 scaffolding.

---

## Layouts

| Layout | Applies To |
|--------|------------|
| `PublicMarketingLayout` | All public (unauthenticated) routes |
| `ManagementLayout` | All authenticated routes (user, supervisor, admin) |

---

## Public Side (unauthenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero + three tactical cards |
| `/about` | About | FBI/military positioning, logistics focus |
| `/capabilities` | Capabilities | Four capability areas |
| `/enterprise` | Enterprise Contact | Enterprise contact form |
| `/packages` | Packages | Package/pricing selection |
| `/email-health-check` | Email Health Check | Public email health check tool |
| `/privacy-policy` | Privacy Policy | Privacy policy |
| `/terms-conditions` | Terms and Conditions | Terms and conditions |
| `/login` | Login | OTP login |
| `/register` | Registration | User registration |

---

## User Side (authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/home` | User Dashboard | Readiness score, module progress, recent intel |
| `/academy` | Training Modules | Module list |
| `/academy/:moduleId` | Module Detail | Module content + quiz |
| `/email-security` | Email Security | Email security module |
| `/simulations` | TTX Scenario List | Replaces TabletopPage + TTXPortalPage combined |
| `/simulations/:runId` | Active TTX Run | Active tabletop exercise run |
| `/simulations/:runId/aar` | After-Action Review | Post-run review |
| `/cabinet` | Knowledge Cabinet | Searchable KB articles + glossary |
| `/intel` | Intel Discovery Hub | Intel article list |
| `/intel/:id` | Intel Article | Individual intel article view |
| `/scorecard` | Readiness Scorecard | Personal readiness scorecard |

---

## Supervisor Side (authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/supervisor` | Group Performance | Team/group overview: members, scores, progress |

---

## Admin Side (authenticated, collapsed from v1)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Overview | KPI cards: total users, readiness avg, module completion |
| `/admin/people` | People Management | User + group management (collapsed from AdminUserManager + AdminGroupManager) |
| `/admin/content` | Content Management | Module + KB + quiz management (collapsed from AdminTrainingManager + AdminKnowledgeBase + AdminConsole tabs) |
| `/admin/ttx` | TTX Management | TTX scenario builder + facilitator (collapsed from AdminTTXManager + AdminTTXFacilitator) |
| `/admin/assignments` | Assignments | Scenario + module assignments to users/groups |
| `/admin/analytics` | Analytics | Analytics dashboard (absorbs `/admin/reports`) |
| `/admin/settings` | Settings | System settings |

---

## Removed from v1

The following routes are explicitly removed in v2. They must not be scaffolded, linked, or aliased.

| Route | v1 Component | Reason for Removal |
|-------|-------------|-------------------|
| `/chat` | OracleChatPage / Oracle Chat | Removed; AI access is contextual, not ambient |
| `/op/:id` | OpFlowWrapper / Operations | Descoped; merges conceptually into TTX simulations |
| `/team-game` | SecurityGame | Descoped from v2 initial scope |
| `/admin/console` | AdminConsole (alias) | Redirect alias; not needed in clean v2 |
| `/admin/enhanced` | — (alias) | Redirect alias; not needed in clean v2 |
| `/admin/users` | AdminUserManager (alias) | Redirect alias; not needed in clean v2 |
| `/admin/groups` | AdminGroupManager (alias) | Redirect alias; not needed in clean v2 |
| `/admin/ops` | Operations (alias) | Redirect alias; not needed in clean v2 |
| `/admin/intel` | Intel admin (alias) | Redirect alias; not needed in clean v2 |
| `/game` | SecurityGame (alias) | Redirect alias; not needed in clean v2 |
| `/tabletop` | TabletopPage (alias) | Redirect alias; not needed in clean v2 |
| `/library` | AdminKnowledgeBase (alias) | Redirect alias; not needed in clean v2 |
| `/identity` | — (alias) | Redirect alias; not needed in clean v2 |
| `/methodology` | — (alias) | Redirect alias; not needed in clean v2 |
| `/contact` | — (alias) | Redirect alias; absorbed into `/enterprise` |
| `/pricing` | — (alias) | Redirect alias; absorbed into `/packages` |
| `/admin/reports` | Reports | Absorbed into `/admin/analytics` |
| `/admin/library` | AdminKnowledgeBase | Absorbed into `/admin/content` |

---

## Notes

- No route appears in both the preserved and removed lists.
- Supervisor access is a role on the ManagementLayout; it does not use a separate layout.
- `/email-security` is a user-facing module page kept as a named route for direct linking; it is not a separate module type — it resolves through the same module rendering system as `/academy/:moduleId`.
