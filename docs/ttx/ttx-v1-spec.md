# TTX Technical Specification: Executive Flow V1

## Objective
Implement a professional, facilitator-led Tabletop Exercise (TTX) module that supports high-fidelity narrative delivery, role-based injects, and structured After-Action Reporting (AAR) with Action Catalog integration.

## 1. Domain Model (Schema)

### TtxScenario (The Template)
- `id`: UUID (Primary Key)
- `title`: String
- `executiveSummary`: Text
- `targetAudience`: JSONB (List of roles)
- `goals`: JSONB (List of measurable goals)
- `metadata`: JSONB (Duration, Category, Signature Theme)

### TtxSection
- `id`: UUID (Primary Key)
- `scenarioId`: UUID (FKey)
- `title`: String
- `order`: Integer
- `background`: Text

### TtxStep
- `id`: UUID (Primary Key)
- `sectionId`: UUID (FKey)
- `title`: String
- `facilitatorNarrative`: Text (Facilitator-only read-aloud)
- `participantSituationRoom`: Text (Public narrative feed for learners)
- `prompts`: JSONB (List of discussion questions)
- `whatGoodLooksLike`: Text (Guidance for facilitator)
- `consequenceNote`: Text (Logic for branching/pacing)

### TtxInject
- `id`: UUID (Primary Key)
- `scenarioId`: UUID (FKey)
- `stepId`: UUID (Link to specific step trigger)
- `type`: String (Technical, Media, Legal, Regulatory)
- `content`: Text
- `targetRoles`: JSONB (List of affected roles)

### TtxExerciseRun (The Instance)
- `id`: UUID (Primary Key)
- `scenarioId`: UUID (FKey)
- `snapshot`: JSONB (Scenario data at time of start)
- `eventLog`: JSONB (Timeline of steps delivered and injects triggered)
- `decisions`: JSONB (Capture of participant decisions per step)
- `status`: String (Scheduled, Active, Hotwash, Complete)

### TtxActionItem (Action Catalog)
- `id`: UUID (Primary Key)
- `runId`: UUID (FKey)
- `title`: String
- `description`: Text
- `owner`: String
- `dueDate`: Date
- `status`: String (Open, In Progress, Complete, Retested)

---

## 2. UI Surfaces

### Admin: Conduct Mode (Facilitator)
- **Hierarchy Browser**: Progress through Sections and Steps linearly.
- **Narrative Delivery**: Single-button to push "Situation Room" text to participants.
- **Inject Control**: Planned list of injects; can be triggered/pushed to specific roles.
- **Hotwash Tool**: Final AAR generation interface that converts `decisions` and `eventLog` into a draft report.

### Learner: Situation Room (Participant)
- **Narrative Feed**: Real-time ticker of delivered scenario text.
- **Inject Inbox**: Role-filtered notifications for "shocks".
- **Interaction**: A simple input to record the group's "Final Decision" when prompted by the facilitator.
- **KB Integration**: Contextual sidebar showing relevant Knowledge Base items linked via scenario tags.

## 3. Implementation Workflow
1.  **Schema Refinement**: Apply the `TtxScenario -> Section -> Step -> Inject -> Run -> ActionItem` migration.
2.  **Backend Services**: Create `TtxService` to manage state transitions and participant broadcasting.
3.  **Facilitator UI**: Build the "Conduct Mode" with step-based timeline control.
4.  **Participant UI**: Build the "Situation Room" with narrative feeds and role-based injects.
5.  **AAR Workflow**: Implement the final report generator that pushes findings to the global `ActionItem` catalog.
