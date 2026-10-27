## Project mission

System Design Academy is a standalone educational application built with Next.js App Router, TypeScript, Tailwind CSS, and repository-owned MDX. V1 has no database or authentication. Keep lessons in Git, search local, and progress browser-local unless a later milestone explicitly changes those boundaries.

## Repository map

- `app/` contains routes and the application shell integration.
- `components/` contains reusable UI, MDX teaching sections, Mermaid rendering, and learning interactions.
- `content/lessons/` is the source of truth for lesson prose and frontmatter.
- `lib/content.ts` owns catalog loading, parsing, and search normalization.
- `docs/content-standards.md` is the mandatory lesson contract.
- `docs/learning-roadmap.md` is the authoritative 64-topic roadmap and progress record.
- `docs/phase-2-architecture-reference.md` is the Architecture Reference Library plan. Phase 2A (Storage & Data slice) is in progress on `feat/phase-2a-technology-landscape` under `/reference`. It must not expand the 64-lesson curriculum or claim all seven landscapes complete.
- `content/architecture/` holds the library graph, deep dives, matrices, and failure walkthroughs. `lib/architecture.ts` loads them. Do not put library pages in `content/lessons/`.
- `scripts/` and `tests/` enforce content and Mermaid rules.

## Required workflow

1. Read `docs/content-standards.md` and the relevant roadmap module before changing lesson content.
2. Inspect nearby lessons and reuse established MDX components before adding new components.
3. Keep content separate from UI; do not place lesson prose in route or component files.
4. Preserve stable lesson slugs. Add a redirect before renaming a published slug.
5. Make the smallest coherent change and avoid unrelated formatting churn.
6. Never commit environment files, secrets, API credentials, generated output, or dependency directories.

## Content and technical quality

- Preserve the required nine-section order: Big Picture, Under the Hood, Mental Model, Architecture Diagram, Real Examples, IC6 Interview Traps, Trade-offs, Knowledge Checks, and Interview-Ready Answer.
- State consistency, durability, ordering, availability, and failure assumptions explicitly. Do not claim exactly-once processing, losslessness, linearizability, or safe failover without defining the boundary that provides it.
- Diagrams must identify authoritative and derived state, consistency boundaries, asynchronous edges, and failure or recovery paths. Keep Mermaid diagrams usable on mobile and provide accessible titles.
- Show units and assumptions in calculations. Cover retry safety, idempotency, overload, skew, and recovery where applicable.
- Lessons over 30 minutes need at least two challenging checks, preferably including a scenario check with plausible distractors.
- Use TokenX and Ad Click Aggregator examples only when their transaction, ordering, and operational constraints are modeled accurately.
- Cross-link related lessons instead of repeating shallow summaries.

## Application standards

- Prefer Server Components; add `"use client"` only where browser state or interaction requires it.
- Keep interactive controls keyboard-accessible, labeled, and understandable without color alone.
- Keep progress storage compatible with `sda:completed-lessons:v1` unless a migration is included.
- Treat MDX as trusted repository content only. Do not enable evaluation of user-provided MDX.
- Consult the installed Next.js documentation under `node_modules/next/dist/docs/` before relying on framework behavior.

## Validation

Before declaring work complete, run:

```bash
npm test
npm run lint
npm run typecheck
npm run validate:content
npm run build
```

Content work is incomplete if the roadmap status is inaccurate or any required check fails. Do not deploy, publish, push, or change remotes unless the task explicitly requests it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
