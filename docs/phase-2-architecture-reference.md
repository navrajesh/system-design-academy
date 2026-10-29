# Phase 2 — Architecture Reference Library

**Status:** Phase 2A and Phase 2B are merged to GitHub `main` at `f4267dd`. Phase C is complete on `feat/phase-c-reference-library` at `0c680d5` and is deployed to Vercel production (`dpl_2bvfmkdXmvWZZD4LCi3ntaicLB5g`, alias `system-design-academy-lemon.vercel.app`). That branch is not merged to `main`. Curriculum remains **64/64**. Library state must not be written to `sda:completed-lessons:v1`.

Phase 2A shipped `/reference` hub, layered explorer, PostgreSQL / Redis / DynamoDB deep dives, two storage matrices, Module 1 summary cards, and a database-failover walkthrough. Phase 2B added the other six module landscapes, extra matrices, named failures, and staff+ interview phrasing on the same explorer.

This document remains the authoritative library plan. Phase C is implemented on `feat/phase-c-reference-library` and deployed from `0c680d5`. Phase D items below are backlog only.

This document is the authoritative Phase 2 architecture plan. It preserves the original Architecture Reference Library and scopes a first feature inside it: **Technology Landscape & Architecture Reference**.

Phase 2 does **not** add lessons to the 64-topic curriculum in [learning-roadmap.md](./learning-roadmap.md). It does not replace Module 7 mock interviews. It does not change V1 boundaries in [AGENTS.md](../AGENTS.md) or [project-handoff.md](./project-handoff.md): Git-backed MDX, local search, browser-local progress under `sda:completed-lessons:v1`, no database or authentication unless a later milestone explicitly changes those boundaries.

## Phase C — this branch (`feat/phase-c-reference-library`)

Phase C does **not** add a 65th lesson and does not change V1 boundaries: Git-backed MDX, local search, `sda:completed-lessons:v1`, no database or authentication.

This branch implements:

1. **Doc reconciliation** — README, project handoff, this plan, the learning roadmap, and AGENTS.md distinguish GitHub `main` (`f4267dd`, Phase 2B) from Vercel production (Phase C `0c680d5`, deployment `dpl_2bvfmkdXmvWZZD4LCi3ntaicLB5g`). `/reference` is the library (hub, explorer, landscapes, matrices, failure walkthroughs, TokenX settlement graph, interview guides).
2. **Duplicate-matrix consolidation** — collapse overlapping comparison matrices under `content/architecture/matrices/` so each property table has one canonical id.
3. **Independent-failure sections** — thicken module landscapes so each names hops that fail independently, with the lesson that teaches the mechanism.
4. **TokenX settlement graph** — `/reference/architecture/tokenx` reuses `ArchitectureExplorer` for reserve / credit / finalize with exclusive terminals. Authoritative ledger versus derived balances, indexes, and analytics. A signed request log is not sufficient evidence for automatic replay of UNKNOWN outcomes.
5. **Five interview selection guides** — short decision guides (not nine-section lessons) that answer which technology class under which assumption. Content lives in `content/architecture/`, not `content/lessons/`.

## Phase D backlog (not implemented)

These are **not** on this branch. Each is a future reference surface under `content/architecture/`, not a 65th curriculum lesson:

- **Pattern catalog** — reusable architecture patterns cross-linked to existing lessons
- **Failure-mode index** — named-failure index across landscapes and walkthroughs
- **Interview diagram pack** — canonical diagrams for Module 7 practice

## Original Phase 2 (preserved)

Add an Architecture Reference Library of:

- reusable patterns
- decision guides
- failure modes
- canonical diagrams

cross-linked to existing lessons and mock interviews.

The library is a **reference surface**, not a ninth teaching module. Lesson prose stays in `content/lessons/`. Required nine-section order and [content standards](./content-standards.md) continue to apply only to curriculum lessons.

Later library entries (pattern catalog, failure-mode index, interview diagram pack) are Phase D backlog under `content/architecture/`; they are not a 65th lesson and are not implemented on this branch.

## Feature: Technology Landscape & Architecture Reference

A navigable map of production technologies, where they sit in a full-stack system, which properties they provide, and which existing lessons teach the underlying mechanisms.

Intended learner outcome: a staff+ candidate can point at a hop in a request path, name the technology class, state the consistency/durability/ordering/failure assumptions, and defend an alternative without inventing a new lesson.

### Non-goals for this feature

- Do not add, split, rename, or reorder the 64 planned lessons.
- Do not put lesson prose in `app/` or `components/`.
- Do not evaluate user-provided MDX.
- Do not deploy, change remotes, or alter Module 5 / Module 7 delivery order.
- Do not treat TokenX as a live chain or wallet product; it remains the curriculum’s ledger example.
- Do not claim exactly-once processing, losslessness, linearizability, or safe failover without naming the boundary that provides it.

## Deliverables

### 1. Full-stack production architecture diagram

One canonical diagram (plus supporting focused diagrams under the ~15-node Mermaid guideline) that shows a production request path from client to durable state and derived views.

Required labels in the diagram or accompanying prose:

- **Authoritative state** versus **derived** caches, indexes, and analytics
- **Consistency boundaries** (process, shard, region, ledger)
- **Synchronous** versus **asynchronous** edges
- **Failure and recovery** paths (timeouts, retries, fencing, replay, evacuation)

Suggested hop set (illustrative, not a mandated vendor list):

```text
Client / edge
  -> DNS and TLS termination
  -> CDN / edge cache
  -> L4/L7 load balancer
  -> API / BFF
  -> authn/authz and rate limit
  -> application compute
  -> cache
  -> primary data store(s)
  -> outbox / log
  -> Kafka (or equivalent log)
  -> consumers / stream jobs
  -> object storage and search/analytics (derived)
```

Link the hops to Module 5 networking, Module 2 scale, Module 1 storage, Module 3 logs, Module 4 latency, and Module 6 correctness lessons listed below.

### 2. Seven module-specific technology landscapes

One landscape per curriculum module. Each landscape is a map of **technology classes** (properties first, vendor names second) that the module’s lessons already justify.

| Module | Landscape focus | Example classes (not exhaustive) |
| ---: | --- | --- |
| 1 Storage & Data | Placement, engines, backups | RDBMS, LSM/document, wide-column, time-series log, object store, saga/outbox coordinators |
| 2 Scalability | Read/write scale and topology | L4/L7 balancers, cache tiers, read replicas, partitioned writers, multi-region traffic managers |
| 3 Kafka & Fault Tolerance | Logs, consumers, degradation | Partitioned logs, consumer groups, stream processors, DLQ/replay, bulkheads |
| 4 Performance | Budgets, queues, cost | Thread/event-loop runtimes, batch/compress, pool/lock control, hedged tails, admission control, profiling backends |
| 5 Networking | Path, protocol, edge | DNS/discovery, TCP/QUIC, HTTP/gRPC, CDN/edge, mesh/proxy, rate limiters, realtime channels |
| 6 CAP & Consistency | Guarantees and repair | Quorum stores, consensus logs, CRDTs/LWW, lease/lock services, idempotency stores |
| 7 Architecture & Interviews | Composition | How mock-interview systems assemble the classes above; no new interview prompt in the 64 |

Each landscape must name **authoritative vs derived state**, **what fails independently**, and **which lesson** teaches the mechanism. Planned Module 5 and 7 lessons may be linked as “planned” until authored.

### 3. Technology comparison matrices

Reusable matrices that compare technology classes on properties, not slogans. Required columns unless a matrix is explicitly narrower:

- Access pattern / workload shape
- Consistency and ordering
- Durability and replication assumptions
- Latency / tail behavior
- Failure mode and operator recovery
- Operational cost and cardinality/ops burden
- When the class is the wrong default

Example rows (illustrative): Postgres vs Dynamo-style KV vs Kafka log vs object storage; Redis cache-aside vs materialized view vs read replica; at-least-once log plus idempotent sink vs a consensus linearizable write.

Matrices live in library content, not inside existing lesson MDX, so lesson contracts stay unchanged. Lessons may later *link* to a matrix; they must not be rewritten as part of documenting this plan.

### 4. Interactive request and failure walkthroughs

Library pages reuse existing interactions where they already change reasoning:

- `ArchitectureWalkthrough` — happy-path hops and ownership
- `ExecutionTimeline` — sequencing, timeouts, and epoch/fencing
- `FailureScenario` — timeout vs 429 vs UNKNOWN, split brain, region loss
- `InteractiveCalculation` — rates, replication bytes, queueing, cost per operation
- `ScenarioCheck` — interview distractors (optional on reference pages; mandatory only on curriculum lessons)

Suggested walkthroughs for the first implementation:

1. **Read path:** cache hit, miss, replica lag, and stale-read admission
2. **Write path:** API idempotency key → primary commit → outbox → log → consumer sink
3. **TokenX transfer:** reserve / credit / finalize with exclusive terminals
4. **Ad Click aggregator:** ingest, dedupe, window, hot key, replay
5. **Overload:** queue bound, shed, retry amplification, bulkhead isolation

### 5. Interview technology selection and tradeoff guides

Short decision guides (not full lessons) that answer “which class, under which assumption?” Each guide must include:

- The invariant or SLO that is non-negotiable
- Two or three defensible options
- The failure that invalidates the popular option
- The operational burden that an interview answer must name
- A pointer into the relevant hardened lesson

Guides are **not** a ninth section contract. They must still state consistency, durability, ordering, availability, and failure assumptions explicitly.

### 6. Web3 / TokenX architecture overlay

An overlay on the full-stack diagram for TokenX as taught in the curriculum: ledger, balances, idempotency, double-spend prevention, settlement, audit, and analytics.

Required teaching boundaries:

- TokenX is a **ledger product example**, not a requirement to run a public chain.
- Distinguish **authoritative ledger state** from **derived balances, indexes, and analytics**.
- Settlement and transfers need exclusive terminals (for example credited vs cancelled) and durable idempotency; a signed request log is not sufficient evidence for automatic replay.
- If a public-chain or L2 comparison appears, name finality, reorg, and custody assumptions instead of equating “blockchain” with linearizability.
- Ad Click Aggregator remains the high-volume, fail-open counterpart; do not steal TokenX fail-closed isolation for ads or the reverse.

This overlay may later support Module 7 “Design TokenX” without rewriting that planned lesson now.

### 7. Links to relevant existing lessons

Library entries must deep-link by **stable slug**. Do not duplicate shallow summaries of hardened lessons.

| Library theme | Primary existing slugs |
| --- | --- |
| Placement and engines | `partitioning-vs-sharding-vs-aggregation`, `relational-vs-nosql-selection`, `data-modeling-from-access-patterns`, `indexes-and-query-execution`, `object-storage-and-large-files` |
| Replication and DR | `replication-and-failover`, `backup-restore-and-disaster-recovery`, `multi-region-design` |
| Scale path | `scaling-read-heavy-services`, `load-balancing-deep-dive`, `caching-patterns-and-invalidation`, `write-scaling`, `fan-out-architectures` |
| Logs and recovery | `kafka-delivery-and-failure`, `kafka-internals`, `consumer-groups-and-rebalancing`, `retries-dead-letters-and-replay`, `disaster-scenarios` |
| Performance | `latency-throughput-and-queues`, `performance-budgets-and-slos`, `tail-latency-control`, `backpressure-and-overload`, `cost-performance-engineering` |
| Correctness | `cap-and-consistency-models`, `consensus-and-leader-election`, `distributed-transactions`, `distributed-locks-and-leases`, `idempotency-and-deduplication` |
| TokenX / ads | `transactions-across-boundaries`, `graceful-degradation`; planned Module 7 `design-tokenx`, `design-an-ad-click-aggregator` |
| Interview composition | `driving-a-system-design-interview`; remaining Module 7 planned slugs |

Planned slugs stay reserved; library pages must not 404. Until those lessons exist, link the roadmap row and the nearest hardened mechanism lesson.

### 8. Reusable components for the future architecture library

**Reuse first** from `components/lesson-components.tsx` and `components/learning-interactions.tsx`:

| Component | Library use |
| --- | --- |
| `ArchitectureDiagram` / `MermaidDiagram` | Canonical and module landscapes |
| `ArchitectureWalkthrough` | Request-path stages |
| `ExecutionTimeline` | Ordered hops and recovery |
| `FailureScenario` | Branching failure choices |
| `InteractiveCalculation` | Capacity, replication, cost |
| `Callout`, `Calculation`, `Details` | Assumptions and supplementary notes |
| `Tradeoffs` (or a library-only analogue) | Selection guides |

**Likely new components** (implement only when this feature is built; names are proposals):

| Proposed component | Responsibility |
| --- | --- |
| `TechnologyMatrix` | Accessible comparison table with property columns and footnotes for assumptions |
| `LandscapeMap` | Module-scoped clickable map from hop → technology class → lesson slug |
| `RequestPathExplorer` | Composes walkthrough + timeline + failure branch for one path |
| `TokenXOverlay` | Toggle authoritative ledger vs derived views on the full-stack diagram |
| `LessonCrossLink` | Typed slug link that fails validation if the slug is unknown or unpublished without a `planned` flag |

Library content should live in a dedicated tree such as `content/architecture/` (proposed), separate from `content/lessons/`, so content validation for the nine-section lesson contract does not apply unless a file is a curriculum lesson.

`"use client"` only where browser interaction requires it. Controls must be keyboard-accessible and not encode meaning by color alone. Diagrams need accessible `title`s. Keep Mermaid usable on mobile.

## Suggested implementation sequence

Do not start this sequence until Phase 1 remaining modules (5 and 7) are complete or a later decision explicitly prioritizes Phase 2.

1. **Contract and content schema** — frontmatter for library pages (id, module landscape, related slugs, diagram ids). Extend `scripts/` / `tests/` so library files are validated without requiring nine lesson sections. Preserve existing lesson validation unchanged.
2. **Shared primitives** — `LessonCrossLink` and `TechnologyMatrix` against one fixture page. No navigation chrome yet beyond a hidden route if needed for review.
3. **Canonical full-stack diagram** — authoritative vs derived, async edges, one failure/recovery path. Independent technical review before additional landscapes.
4. **Module landscapes 1, 2, 3, 4, 6** — hardened modules first, exclusive file ownership per landscape, coordinator-owned index.
5. **Request and failure walkthroughs** — read, write, TokenX, Ad Click, overload. Reuse existing interaction components.
6. **Comparison matrices and interview selection guides** — property-first tables; TokenX overlay last among content so ledger terminals stay consistent with Module 1/6 audit findings.
7. **Module 5 and 7 landscapes** — fill as those lessons harden; planned-slug handling until then.
8. **Shell integration** — dashboard/reference entry, search inclusion for library text, no change to lesson slugs or `sda:completed-lessons:v1` unless a migration is included. Progress for library pages is optional and must not overwrite lesson completion keys.
9. **Validation and browser QA** — full `npm test`, lint, typecheck, `validate:content`, production build, plus keyboard and mobile checks of maps, matrices, and walkthroughs.

Coordinator owns shared metadata, search indexing, and Git. Authors own exclusive content files. Independent review is required for correctness of TokenX terminals, Kafka durability assumptions, and CAP/quorum diagrams.

## Acceptance criteria

The feature is complete only when all of the following hold:

- The 64-lesson roadmap is unchanged in count, module membership, and published slugs.
- Existing Phase 2 library goals (patterns, decision guides, failure modes, canonical diagrams, cross-links) are still represented; this feature is the first slice, not a replacement.
- One full-stack production diagram identifies authoritative vs derived state, consistency boundaries, asynchronous edges, and at least one failure or recovery path.
- Seven module landscapes exist (Module 5/7 may mark planned lessons without fabricating content).
- At least one comparison matrix per of: storage engines, cache/replica/read-path, log vs consensus write path.
- Interactive read-path, write-path, and at least one failure walkthrough ship with accessible controls.
- interview selection guides state assumptions and link to hardened lessons by slug.
- TokenX overlay preserves exclusive transfer terminals and does not auto-replay UNKNOWN request-only outcomes.
- New library components are reused by more than one page or are documented as single-purpose with a removal plan.
- Content remains repository-owned MDX (or equivalent Git content); no user-authored MDX evaluation; no database or auth requirement.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run validate:content`, and `NODE_ENV=production npm run build` pass.
- Browser QA covers desktop and a mobile viewport for the canonical diagram and one matrix.

## Out of scope until a later decision

- Phase D backlog (pattern catalog, failure-mode index, interview diagram pack) — not implemented on this branch
- Rewriting existing lessons to embed matrices
- Merging this branch to `main` until explicitly authorized. Production already serves `0c680d5`; do not deploy again for a documentation-only commit
- Applying or dropping `stash@{0}`
