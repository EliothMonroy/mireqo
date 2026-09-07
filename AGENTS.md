# Coding agent guidance

Mireqo is an Android and iOS application for discovering nearby events or events in a selected city. This document governs how coding agents work in this repository. It does not select a technology stack or define the application architecture.

## Autonomy and collaboration

- Make routine, reversible implementation decisions independently when they follow the agreed scope and established patterns.
- Discuss changes to product behavior, architecture, or major dependencies before implementing them, unless already explicitly authorized.
- When a requirement is ambiguous, choose the simplest interpretation consistent with the specs unless it materially changes the user experience or creates a costly commitment. In those cases, explain the ambiguity and ask for a decision.
- Do not repeatedly request approval for decisions the user has already authorized.

## Specification authority and scope

- [High-level specification](spec/high-level-spec.md) defines product scope and exclusions.
- [Feature specification](spec/feature-spec.md) defines detailed feature behavior and acceptance criteria.
- [UI specification](spec/ui-spec.md) defines presentation and interaction behavior.
- [Architecture](architecture.md) defines the agreed technical structure and boundaries. Consult it before changing application structure or data flow.
- [Build guidance](build.md) defines environment, dependency, build, and check workflows. Follow its repository-tooling rules and distinguish planned commands from implemented ones.
- Explicit user direction overrides these documents. Flag any resulting documentation mismatch.
- If the specs conflict materially, explain the conflict and ask for a decision rather than silently choosing which requirement to ignore.
- Examples and optional features are not automatically requirements.
- Implement only the requested work. Do not add accounts, payments, social features, or optional features without direction.

## Code-change workflow

Whenever code changes are to be implemented, [implement_new_feature.md](implement_new_feature.md) is the source of truth for the implementation workflow, persona assignments, handoffs, delegation, code-quality standards, product guardrails, verification, and delivery. Read it before starting code changes and follow the linked persona for the assigned role.
