# Five Eyes Project Roadmap

This roadmap defines the prioritized execution order to reach a stable, governed staging environment and eventually a polished product.

## 1. Roadmap Strategy
- **Reality-Driven**: Only build what is proven missing or broken.
- **Backend First**: Secure the infrastructure before expanding the interface.
- **Tight Focus**: Deferred side missions (TTX v1 is the only exception).

---

## 2. Execution Phases

### Phase 1: Current Truth Locked (Status: COMPLETED)
- [x] **1A: Infrastructure Baseline**: Backend staging shell (ECS/RDS/SES) confirmed live and healthy.
- [x] **1B: Baseline Documentation**: Functional flowchart and roadmap converted to markdown source.

### Phase 2: Frontend Reality Pass (Status: COMPLETED)
- [x] **2A: Audit Route Integrity**: Confirmed routing in `App.tsx` matches functional components.
- [x] **2B: Data Wiring Audit**: Verified core OTP, Hub, Module, KB Admin, and Progress features are fully wired to the backend.
- [x] **2C: Identify Gaps**: Mapped missing navigation shell, dashboards, and TTX v1 integration.

### Phase 3: Build Missing Core Flow (Status: COMPLETED)
- [x] **3A: NavShell Layout**: Integrated role-aware layout for Admin and Learner portals.
- [x] **3B: Portal Dashboards**: Built and wired Admin and Learner overview pages.
- [x] **3C: TTX v1 Thin Slice**: Re-integrated core TTX routes into the main application.

### Phase 4: TTX v1 "Executive Standard" (Status: COMPLETED)
- [x] **4A: Product Standard**: Defined `ttx-executive-standard.md` and "Scenario -> Sections -> Steps" model.
- [x] **4B: Flagship Scenario**: Created high-fidelity `compromised-at-the-perimeter.md`.
- [x] **4C: Schema Refinement**: Implement the full TTX domain model (Scenario/Section/Step/Inject/Run/Action).
- [x] **4D: Facilitator/Participant UI**: Build the Conduct Mode and Situation Room interfaces.
- [x] **4E: Action Catalog**: Implement the persistent remediation tracking and AAR workflow.

### Phase 5: Meaningful Staging Validation (Status: IN PROGRESS)
- [/] **5A: Frontend Deployment**: Build and deploy the frontend to AWS (S3/CloudFront).
- [ ] **5B: End-to-End Smoke**: Verify full path on the staging environment.

### Phase 6: Style Pass (Status: LATER)
- [ ] **6A: Premium Direction**: Reapply the high-fidelity design direction once logic is fixed.

---

## 3. Out of Scope (Later)
- Full TTX platform expansion.
- Game engine overhaul.
- Non-essential UI refactors.
