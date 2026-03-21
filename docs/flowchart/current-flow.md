# Five Eyes Current App Flow

This document defines the functional architecture of the application based on the current codebase reality. It is the primary reference for routing and logic.

## 1. Core Operating Principles
- **Truth Over Polish**: Functional logic and data integrity must be verified via smoke tests before reapplying visual styling.
- **KB/Governance First**: Knowledge Base truth and lineage precede AI assists.
- **Admin/Learner Isolation**: Strict separation between Admin (password) and Learner (OTP) boundaries.

---

## 2. Infrastructure Truth
- **Backend Staging Shell [COMPLETE]**: ECS Fargate + RDS + SES is live and healthy.
- **Frontend Staging [PENDING]**: Not yet meaningfully validated in the cloud.

---

## 3. Application State (Built vs. Missing)

### Admin Portal (Partially Built)
- **Built**:
    - `/admin/login`: Password-based entry.
    - `/admin/progress` & `/admin/assignments`: Initial tracking and control pages.
    - `/kb`, `/kb/topics`, `/kb/modules`: Full content and lineage management.
- **Missing**:
    - Centralized Admin Dashboard (Overview of system health/metrics).
    - User/Learner Management (Invite/Audit).

### Learner Portal (Foundational)
- **Built**:
    - `/learn`: Learner hub showing available content.
    - `/learn/modules/:id`: Interactive module viewing and quizzes.
    - `/kb/search` & `/kb/:id`: Grounded item lookup.
- **Missing**:
    - **Learner Auth (OTP)**: No dedicated `/login` or `/otp` route currently wired.
    - **Session Start**: Initial learner registration/entry flow.

### TTX System (Isolated)
- **Status**: Code exists but routes are commented out in `App.tsx` for staging stability.
- **Missing**: "Thin slice" definition (minimal viable flow for staging).

---

## 4. Work Flow
- Current truth locked (Done).
- Frontend reality pass (Next).
- Build missing learner/admin flows.
- Define TTX v1 thin slice.
- Full staging verification.
