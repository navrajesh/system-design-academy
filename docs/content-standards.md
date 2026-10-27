# System Design Academy content standards

Every lesson in `content/lessons` must teach a transferable mental model, connect it to production behavior, and prepare the learner to explain a defensible design. A lesson is not complete when it merely defines terms.

## Non-negotiable learning standard

Every lesson must teach through five complementary modes while preserving the nine-section contract below:

1. **Big Picture** — explain why the concept matters, where it fits, and preview the relevant architecture and state boundaries.
2. **Under the Hood** — walk through execution, data flow, calculations, failure scenarios, and technical trade-offs step by step.
3. **Mental Model to Retain** — provide a simple analogy plus a compact, transferable takeaway.
4. **IC6 Interview Traps** — include challenging questions, likely follow-ups, and defensible answers or decision criteria.
5. **Practical Learning** — use concrete systems such as TokenX, the Ad Click Aggregator, or another technically appropriate production example.

## Mandatory frontmatter

Every MDX file must begin with:

```yaml
---
title: "Specific, searchable lesson title"
description: "One sentence describing the learner outcome."
module: 1
moduleTitle: "Storage & Data"
order: 1
duration: 35
difficulty: "Foundation" # Foundation | Intermediate | Advanced
tags:
  - partitioning
objectives:
  - "Observable outcome beginning with a verb"
---
```

- The filename is the permanent URL slug. Do not change it after publication without adding a redirect.
- Use three to six precise search tags and two to four outcomes.
- Duration is an honest active-reading estimate including knowledge checks.
- Module number and title must match the roadmap.

## Mandatory lesson structure

Every lesson must use these sections in this order. Custom titles are encouraged, but the component names are fixed.

1. `<BigPicture>` — define the problem, establish scope, state why it matters, and preview where it sits in the architecture.
2. `<UnderTheHood>` — explain the mechanism step by step. Include data flow, state ownership, calculations, failure points, and trade-offs.
3. `<MentalModel>` — give the learner a simple analogy and compact reasoning framework that transfers to new systems.
4. `<ArchitectureDiagram>` — include a Mermaid diagram and prose that explains ownership, consistency boundaries, state, failure, and recovery paths.
5. `<RealExamples>` — ground the mechanism in at least two credible product or infrastructure examples.
6. `<InterviewTraps>` — identify mistakes, ambiguous claims, challenging follow-ups, and defensible responses expected at IC6 depth.
7. `<Tradeoffs>` — compare alternatives across correctness, latency, availability, cost, and operational complexity.
8. `<KnowledgeCheck>` — include at least one scored multiple-choice question with an explanation. Prefer two for lessons longer than 30 minutes.
9. `<InterviewAnswer>` — end with a concise, spoken-style answer that a candidate could adapt, not memorize blindly.

Supporting components are `Callout`, `Calculation`, `Details`, `InteractiveCalculation`, `ExecutionTimeline`, `FailureScenario`, `ArchitectureWalkthrough`, and `ScenarioCheck`. They supplement the required sections; they do not replace them. Prefer one interaction that changes the learner's reasoning over several decorative widgets.

## Technical bar

- Quantify workloads. Show units, average and peak rates, payload size, retention, and replication assumptions when relevant.
- Name the consistency, ordering, durability, and failure boundaries. Avoid absolute “exactly once” or “never loses data” claims without defining scope.
- Separate source-of-truth state from caches, indexes, and other rebuildable views.
- Explain skew and hot-key behavior for any partitioned design.
- Cover retry safety, idempotency, backpressure, overload, and recovery wherever those behaviors apply.
- State assumptions. If a value is illustrative rather than measured, label it.
- Use technology names only after identifying the required property.
- Prefer concrete mechanisms over slogans. “Use caching” is incomplete without placement, key, freshness, invalidation, and failure behavior.

## Diagrams

Use Mermaid `flowchart`, `sequenceDiagram`, or `stateDiagram-v2`. Keep the primary path readable left-to-right when possible.

- Label asynchronous edges, consistency boundaries, keys, and replay paths.
- Distinguish authoritative stores from derived state in the accompanying prose.
- Keep diagrams below roughly 15 nodes. Split complex systems into focused diagrams.
- Do not encode essential meaning by color alone.
- Provide a descriptive `title` because it becomes the diagram's accessible label.

## Knowledge checks

A check must test reasoning rather than vocabulary. Distractors should be plausible misconceptions. The explanation must say why the correct answer is correct and, when useful, why the tempting alternative fails. Every lesson must retain at least one `<KnowledgeCheck>`; lessons longer than 30 minutes must contain at least two checks in total, with at least one `<ScenarioCheck>` preferred.

```mdx
<KnowledgeCheck
  question="What happens when...?"
  options={["Plausible A", "Correct B", "Plausible C", "Plausible D"]}
  correct={1}
  explanation="B is correct because..."
/>
```

The `correct` index is zero-based.

## Style and accessibility

- Write in direct, plain English for practicing software engineers.
- Expand uncommon acronyms on first use.
- Keep paragraphs short and use descriptive headings.
- Never rely only on color or position to convey meaning.
- Avoid directional phrases such as “the diagram below” that fail when layouts change.
- Do not place required learning content behind `Details`; collapsed content is supplementary.
- Use real names only for public technical examples. Do not include confidential incidents or customer data.

## Review checklist

Before merging a lesson:

- [ ] Frontmatter is complete and the slug is stable.
- [ ] All nine required sections exist in the required order.
- [ ] Calculations are dimensionally correct and assumptions are explicit.
- [ ] Diagram syntax renders and the prose explains it.
- [ ] The diagram names authoritative and derived state, consistency boundaries, and at least one failure or recovery path where applicable.
- [ ] Correctness and failure behavior are technically defensible.
- [ ] Trade-offs cover more than performance.
- [ ] Quiz answer and explanation are correct.
- [ ] Lessons over 30 minutes contain at least two challenging checks.
- [ ] The mental model includes a concrete analogy and compact takeaway.
- [ ] The interview answer fits in roughly 60–90 seconds spoken.
- [ ] Search terms appear naturally in title, description, tags, or body.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.
