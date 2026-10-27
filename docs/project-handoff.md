# System Design Academy project handoff

## Purpose

System Design Academy is a standalone, hostable learning product for engineers preparing for system design interviews and production architecture work. Content is versioned as MDX in Git, progress is stored locally in the browser, and V1 intentionally has no database, authentication, or external search service.

## Architecture and technology stack

- **Framework:** Next.js App Router with statically generated lesson routes
- **Language:** TypeScript with strict type checking
- **Presentation:** React 19 and Tailwind CSS
- **Content:** Local MDX with validated YAML frontmatter
- **Diagrams:** Mermaid, rendered client-side with accessible titles
- **Interactions:** Reusable calculations, execution timelines, failure scenarios, architecture walkthroughs, and scenario checks
- **Search:** Build-time local lesson catalog and normalized lesson text
- **Progress:** `localStorage` under `sda:completed-lessons:v1`
- **Validation:** Node test runner, ESLint, TypeScript, custom content validation, Mermaid parsing, and the Next.js production build

The main boundaries are:

```text
content/lessons/*.mdx
        |
        v
lib/content.ts ----> static lesson routes and local search index
        |                         |
        v                         v
MDX component registry      responsive application shell
        |                         |
        +---- Mermaid and learning interactions
                                  |
                                  v
                     browser-local completion progress
```

Authoritative curriculum state lives in `content/lessons/`. Search data and rendered pages are derived and rebuildable. Completion state is device-local and is not synchronized.

## Seven-module roadmap

| Module | Planned lessons | Current state |
| --- | ---: | --- |
| 1. Storage & Data | 9 | 9 authored; coverage complete |
| 2. Scalability | 8 | 8 authored; coverage complete |
| 3. Kafka & Fault Tolerance | 9 | 9 authored; coverage complete |
| 4. Performance | 9 | 9 authored; coverage complete |
| 5. Networking | 9 | 1 foundation lesson authored |
| 6. CAP & Consistency | 9 | 9 authored; coverage complete |
| 7. Architecture & Mock Interviews | 11 | 1 foundation exercise authored |
| **Total** | **64** | **46 authored, 18 planned** |

Modules 1, 2, 3, 4, and 6 are complete in topic coverage. Module 2 is merged on `main` at `f09dbb4`. Module 3 is merged on `main` at `8ad26ed`. Module 4 is merged on `main` at `1a0c2a3`. The Modules 1 and 6 technical audit (13 items) is merged on `main` at `3e5a71e`. Module 5 remaining lessons are in progress on `feat/module-5-networking`.

## Current progress

- Phase 0 foundation hardening is complete.
- Phase 1A authored all nine lessons in Module 1 and all nine lessons in Module 6.
- The repository contains **46 of 64 lessons** after completing Module 4.
- All seven modules have at least one foundation lesson.
- The future Architecture Reference Library remains Phase 2 and has not been implemented. The plan, including the Technology Landscape & Architecture Reference feature, lives in [phase-2-architecture-reference.md](./phase-2-architecture-reference.md). It does not change the 64-lesson curriculum.

## Technical audit status

The Modules 1 and 6 audit found **13 items**. All 13 are addressed and merged to `main` in `3e5a71e`.

| Priority | Finding | Remediation on this branch |
| --- | --- | --- |
| High | TokenX saga may release a reservation before a delayed destination credit commits | Exclusive B `CREDITED`/`CANCELLED` and A `FINALIZED`/`RELEASED`; unique atomic `RESERVED` insert on `transfer_id`; dashed edges are rejected commands; `UNRESOLVED` until B's committed row is known |
| High | A committed Raft no-op is presented as sufficient ongoing read authority | Current-term ReadIndex heartbeats or bounded-clock lease; higher term steps down; `lastApplied >= readIndex` on both paths |
| Medium | Kafka durability is described without the complete broker and producer assumptions | RF=3, `acks=all`, `min.insync.replicas=2`, producer idempotence, ISR-only election, retention, correlated-failure scope |
| Medium | A protected resource may accept a stale fencing token before observing the new epoch | Retain durable high-water token before work; expiry is not immediate exclusion; survive restart |
| Medium | Local atomic idempotency and recoverable `IN_PROGRESS` workflow idempotency are conflated | Separate one-commit SUCCEEDED from durable IN_PROGRESS with owner, epoch, and takeover |
| Medium | Read-position tokens omit shard/log identity and failover lineage | Token is `{shard, epoch/timeline, commit position}` with ancestry and current-authority checks |
| Medium | TrueTime's 7 ms example does not define epsilon versus full interval width | ε is half-width; wait until earliest > t (~2ε); overlap wait with replication |
| Medium | Signed request logs are treated as sufficient evidence for post-restore replay | Auto-replay committed journals only; request-only outcomes are UNKNOWN; fence before new writes |
| Medium | The CAP quorum diagram visually implies all three replicas are required | Leader plus either follower as a 2-of-3 quorum; minority isolated; quorum ≠ full cluster |
| Low | An idempotency key is called globally unique despite tenant-scoped schema | Uniqueness is `UNIQUE (tenant_id, operation, idempotency_key)` |
| Low | B-tree height arithmetic uses an ambiguous definition of level | Height includes leaf; fanout and fill factor stated; not exact disk I/O |
| Low | Kafka partitioning is said to preserve campaign event order too broadly | Broker append/offset order distinguished from event-time and causal order |
| Low | Several knowledge checks are arithmetic-only or have implausible distractors | Object-storage, time-series, restore, and replication checks now test violated assumptions |

### Non-blocking residual notes

- The Module 1 transactions diagram packs outbox and exclusive TokenX forks at the ~15-node Mermaid cap and is dense on mobile.
- Coordinator `UNRESOLVED` query edges can still look like state transitions; dashed reject arrows still land on terminal nodes even though labels deny a `CANCELLED ↔ CREDITED` move.
- Lease-read safety is taught as “lease duration strictly larger than assumed max clock drift,” an operational planning bound, not the full new-leader wait-out-old-lease formula and not a measured Raft guarantee.
- Diagrams and exercises were not visually re-checked in a browser as part of this audit.
- `stash@{0}` (`wip-remaining-11-audit-findings`) remains in the local repository and must not be applied wholesale.

## Next milestone

1. Complete remaining Module 5 Networking lessons on `feat/module-5-networking`. Do not push, merge, or deploy this branch until a later decision. Do not apply or drop `stash@{0}` until a later decision.
2. Resume Module 7 mock-interview lessons after Module 5.

Phase 2 is explicitly out of scope for this milestone. The Phase 2 plan is documented only; do not build library routes, components, or navigation until a later decision.

## Validation commands

Run from the repository root with Node.js 20.9 or newer:

```bash
npm install
npm test
npm run lint
npm run typecheck
npm run validate:content
npm run build
```

Before a release or handoff, also inspect:

```bash
git status --short
git diff --check
git diff --cached --check
git diff --cached --stat
```

Never commit `.env*`, credentials, API keys, dependency directories, `.next`, coverage, or other generated build output.
