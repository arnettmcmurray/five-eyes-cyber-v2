# Current State Audit - Frontend Reality

This document summarizes the actual functional state of the Five Eyes frontend as of 2026-03-20.

## 1. Working (Wired to Backend)

### Learner Flow
- **Authentication**: OTP request and verification (wired in `LearnHub.tsx`).
- **Hub**: Module listing with progress status (Started, Completed, Locked) and prerequisite checks.
- **Module Experience**: Full study-to-practice flow. Supports content roles (prereq/primary), references, and module-specific KB search.
- **Practice & Grading**: Multiple-choice assessment with instant grading and remediation (topic/KB recommendations).
- **Session Management**: Persistent learner tokens and handles in `localStorage`.

### Admin Flow
- **Authentication**: Password-based login and session management.
- **KB Management**: Full listing, status/type filtering, and ingestion (Manual, File, and URL triggers).
- **Progress Tracking**: Holistic views of learner progress "By Learner" and "By Module" (Detailed scores and activity timestamps).
- **Content Governance**: Draft/Review/Publish workflows and version lineage tracking.

---

## 2. Missing (Core Gaps)

### Architectural Connective Tissue [COMPLETE]
- **Unified Layout**: `NavShell` implemented with role-aware headers/sidebars.
- **Central Dashboards**: `/admin` and `/learn/dashboard` overview pages are live and wired.
- **Common UI Library**: Initial component standardization begun within `NavShell`.

### Feature Gaps
- **TTX v1 "Executive Standard" [IN PROGRESS]**:
  - **Status**: Core staging foundation is live, but the transition to the **Executive Standard** (Scenario -> Sections -> Steps) is the current build lane.
  - **Key Assets**: [Flagship Scenario](file:///Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2/docs/ttx/scenarios/compromised-at-the-perimeter.md), [Build-Ready Spec](file:///Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2/docs/ttx/ttx-v1-spec.md), and [Executive Philosophy](file:///Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2/docs/ttx/ttx-executive-standard.md).
- **Staging Deployment**: Frontend not yet built/deployed to the cloud (AWS S3/CloudFront).


---

## 3. Implementation Next Steps
1.  **Unified NavShell**: Implement a common layout for Admin and Learner portals.
2.  **Portal Dashboards**: Create core overview pages for `/admin` and `/learn`.
3.  **TTX v1 Re-integration**: Re-enable a minimal scenario flow for staging.
4.  **Frontend Staging Build**: Script the build and deploy to AWS.
5.  **Aesthetic Alignment**: Apply the "Five Eyes" high-fidelity theme to all pages.
