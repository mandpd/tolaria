# Visual Links Graph

## Objective

Add a visual links graph to Tolaria that renders vault files as nodes with relationships (wikilinks, `relates-to` frontmatter) as edges. Research a suitable TypeScript graph visualization library for the Tauri/React stack, then implement it as a clickable side-menu option.

## Original Request

> I'd like to add a visual links graph option to this tauri app with react source code. Research a suitable typescript library to be able to visualize the files in a tolaria vault as nodes and the frontmatter relates-to and other wikilinks as relationships. Once you've identified the library to use, go ahead and implement the feature. It should appear as a clickable menu option on the tolaria side menu.

## Intake Summary

- Input shape: `specific`
- Audience: Tolaria users exploring their vault's link structure
- Authority: `requested`
- Proof type: `demo`
- Completion proof: A working interactive graph view in the Tolaria app, accessible from the side menu, showing vault files as nodes connected by wikilinks and `relates-to` edges
- Goal oracle: Open the graph view from the side menu, verify files render as nodes, verify wikilinks and `relates-to` relationships render as connecting edges, verify the graph is interactive (pan, zoom, click to navigate)
- Likely misfire: Picking a library that doesn't work well in Tauri/WKWebView, or building a static non-interactive view that looks like a graph but isn't useful for vault exploration
- Blind spots considered: WKWebView rendering compatibility, performance with large vaults, integration with existing Tolaria navigation and theming, canvas vs SVG tradeoffs, bundle size impact
- Existing plan facts: The user wants research first, implementation second, and the feature must be accessible from the Tolaria side menu

## Goal Oracle

The oracle for this goal is:

**A working interactive graph view in the Tolaria app, launched from the side menu, that displays vault files as nodes connected by wikilink and `relates-to` edges, supporting pan, zoom, and click-to-navigate.**

The PM must keep comparing task receipts to this oracle. Planning, discovery, a passing tiny slice, or a clean-looking board is not enough. The goal finishes only when a final Judge/PM audit maps receipts and verification back to this oracle and records `full_outcome_complete: true`.

## Goal Kind

`specific`

## Current Tranche

Discover the best graph visualization library through targeted research, then implement a complete working graph view accessible from the Tolaria side menu. The implementation must handle real vault data (files, wikilinks, `relates-to` frontmatter), render an interactive graph, and integrate with existing Tolaria navigation and theming.

## Non-Negotiable Constraints

- Must work in Tauri's WKWebView on macOS
- Must use TypeScript and integrate with the existing React codebase
- Must reuse existing Tolaria UI components and visual language (shadcn/ui)
- Must be accessible from the Tolaria side menu
- Must handle wikilinks and `relates-to` frontmatter as edge types
- Bundle size must be reasonable for a desktop app

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if the user asked for working software or automation and a safe Worker task can be activated.

Do not stop after a single verified Worker package when the broader owner outcome still has safe local follow-up work. Advance the board to the next highest-leverage safe Worker package and continue unless a phase, risk, rejected-verification, ambiguity, or final-completion review is due.

Do not create one Worker/Judge pair per repeated file, table, route, or helper. Put repeated same-shape work into one Worker package and review the package as a whole.

## Slice Sizing

Safe means bounded, explicit, verified, and reversible. It does not mean tiny.

A good task is the largest safe useful slice.

Small is not the goal. Useful is the goal.

A Worker should finish the whole assigned slice. A Judge should judge the whole assigned slice. A PM should reorient the board when tasks are safe but not moving the outcome.

Tiny tasks are allowed when the failure is isolated, the risk is high, the scope is unknown, or the tiny task unlocks a larger slice. Tiny tasks are bad when they keep happening, do not change behavior, only add wrappers/contracts/proof files, or avoid the real milestone.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/visual-links-graph/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/visual-links-graph/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Run the bundled GoalBuddy update checker when available and mention a newer version without blocking.
4. Re-check the intake: original request, input shape, authority, proof, blind spots, existing plan facts, and likely misfire.
5. Work only on the active board task.
6. Assign Scout, Judge, Worker, or PM according to the task.
7. Write a compact task receipt.
8. Update the board.
9. If safe local work remains, choose the next largest reversible Worker package and continue unless blocked.
10. If a problem, suggestion, or follow-up should become a repo artifact, create an approved issue/PR or ask the operator whether to create one.
11. Review at phase, risk, rejected-verification, ambiguity, or final-completion boundaries; do not review every small Worker by habit.
12. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome and records `full_outcome_complete: true`.

Issue and PR handoffs are supporting artifacts. `state.yaml` remains authoritative, and every external artifact decision must be recorded in a task receipt.