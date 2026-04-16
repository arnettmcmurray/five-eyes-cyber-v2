# (Five Eyes) Tabletop Exercise (TTX) System

This directory contains the executive-grade specifications and content for the Five Eyes TTX platform.

## Core Documentation

- **[TTX Executive Standard](./ttx-executive-standard.md)**: The "North Star" for scenario quality and product philosophy.
- **[TTX Technical Spec](./ttx-v1-spec.md)**: The implementation blueprint for the "Scenario -> Sections -> Steps" model.

## Scenario Library

- **[Flagship Scenario: Compromised at the Perimeter](./scenarios/compromised-at-the-perimeter.md)**: Our signature theme demonstrating the convergence of physical and digital security.
- **[Scenario Template](./templates/ttx-scenario-template.md)**: The standardized format for creating new, high-fidelity scenarios.

## Reference Material

- **[Industry Standard Scenarios](./reference/)**: Raw material from NIST, CIS, and FEMA used to ground our simulations.

## Operational Surfaces

The TTX platform provides three primary interfaces for exercise management and execution:

- **[Facilitator Conduct Mode](../../src/pages/TtxConduct.tsx)**: The command center for managing the narrative flow, delivering tactical injects, and monitoring participant decision-making in real-time.
- **[Participant Situation Room](../../src/pages/TtxParticipate.tsx)**: The immersive interface where learners receive narratives and tactical updates, and commit their decisions to the official record.
- **[After-Action Review (AAR)](../../src/pages/TtxAAR.tsx)**: The post-mission reporting module for drafting executive summaries and tracking prioritized remediation findings in the **Action Catalog**.

## Workflow

1.  **Scenario Authoring**: Use the [Scenario Editor](../../src/pages/TtxScenarioEdit.tsx) to define the Sections, Steps, and Injects based on the [Executive Standard](./ttx-executive-standard.md).
2.  **Session Initialization**: Create a new session from the [TTX Sessions Dashboard](../../src/pages/TtxSessions.tsx).
3.  **Exercise Conduct**: The facilitator uses **Conduct Mode** to advance through the narrative. Participants join the **Situation Room** via the provided invitation link.
4.  **AAR Generation**: Upon conclusion, the facilitator finalizes the **After-Action Report** and populates the **Action Catalog** for persistent remediation tracking.
