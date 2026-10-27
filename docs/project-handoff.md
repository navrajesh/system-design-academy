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
| 2. Scalability | 8 | 1 foundation lesson authored |
| 3. Kafka & Fault Tolerance | 9 | 1 foundation lesson authored |
| 4. Performance | 9 | 1 foundation lesson authored |
| 5. Networking | 9 | 1 foundation lesson authored |
| 6. CAP & Consistency | 9 | 9 authored; coverage complete |
| 7. Architecture & Mock Interviews | 11 | 1 foundation exercise authored |
| **Total** | **64** | **23 authored, 41 planned** |

Modules 1 and 6 are complete in topic coverage and conform to the automated content contract. They are not frozen: the technical audit below identified corrections required before treating every guarantee as production-defensible.

## Current progress

- Phase 0 foundation hardening is complete.
- Phase 1A authored all nine lessons in Module 1 and all nine lessons in Module 6.
- The repository contains **23 of 64 lessons**.
- All seven modules have at least one foundation lesson.
- The future Architecture Reference Library remains Phase 2 and has not been implemented.

## Outstanding technical audit findings

The Modules 1 and 6 audit found **13 items**. High findings, Kafka, fencing/idempotency, and session read tokens (M4) are remediating on `fix/distributed-systems-audit`; **6 Medium and Low items remain**. Correctness defects and unstated protocol assumptions take priority over editorial improvements.

| Priority | Finding | Required remediation |
| --- | --- | --- |
| High (this branch) | TokenX saga may release a reservation before a delayed destination credit commits | Exclusive B `CREDITED`/`CANCELLED` and A `FINALIZED`/`RELEASED`; `UNRESOLVED` until B's committed row is known |
| High (this branch) | A committed Raft no-op is presented as sufficient ongoing read authority | Current-term commit knowledge, ReadIndex or lease, then `lastApplied >= readIndex` before serving |
| Medium (this branch) | Kafka durability is described without the complete broker and producer assumptions | RF=3, `acks=all`, `min.insync.replicas=2`, producer idempotence, ISR-only election, retention, correlated-failure scope |
| Medium (this branch) | A protected resource may accept a stale fencing token before observing the new epoch | Retain durable high-water token before work; expiry is not immediate exclusion; survive restart |
| Medium (this branch) | Local atomic idempotency and recoverable `IN_PROGRESS` workflow idempotency are conflated | Separate one-commit SUCCEEDED from durable IN_PROGRESS with owner, epoch, and takeover |
| Medium (this branch) | Read-position tokens omit shard/log identity and failover lineage | Token is `{shard, epoch/timeline, commit position}` with ancestry and current-authority checks |
| Medium | TrueTime's 7 ms example does not define epsilon versus full interval width | Define the interval and calculate worst-case and overlapped commit wait separately |
| Medium | Signed request logs are treated as sufficient evidence for post-restore replay | Replay only committed journals automatically; classify request-only outcomes as unknown |
| Medium | The CAP quorum diagram visually implies all three replicas are required | Show leader plus either follower as a 2-of-3 quorum |
| Low | An idempotency key is called globally unique despite tenant-scoped schema | Describe uniqueness within tenant and operation scope |
| Low | B-tree height arithmetic uses an ambiguous definition of level | Define branching levels, leaf level, fanout assumptions, and fill factor |
| Low (this branch) | Kafka partitioning is said to preserve campaign event order too broadly | Broker append/offset order distinguished from event-time and causal order |
| Low | Several knowledge checks are arithmetic-only or have implausible distractors | Replace selected checks with failure-oriented production scenarios |

## Next milestone

1. Review High remediations through Batch 3 (session read tokens), then continue remaining Medium/Low batches.
2. Re-run the complete validation suite and review the affected diagrams and exercises on desktop and mobile.
3. Begin Module 3, **Kafka & Fault Tolerance**, with Kafka Internals, Consumer Groups and Rebalancing, and Ordering and Event Keys before progressing to stream processing and disaster scenarios.

Phase 2 is explicitly out of scope for this milestone.

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
