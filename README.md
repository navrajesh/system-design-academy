# System Design Academy

A standalone, responsive learning product built with Next.js App Router, TypeScript, Tailwind CSS, and Git-backed MDX. V1 has no database and no authentication: curriculum content is compiled from local files, lesson progress lives in the browser, and search runs over the local lesson corpus.

## Features

- Premium dashboard and responsive desktop/mobile navigation
- Seven learning modules with local MDX lesson pages
- Architecture Reference Library at `/reference`: module landscapes, layered explorer, comparison matrices, and named failure walkthroughs
- Reusable instructional sections and Mermaid architecture diagrams
- Interactive capacity calculators, execution timelines, failure explorers, and architecture walkthroughs
- Accessible factual and scenario-based knowledge checks
- Browser-local completion tracking with no account required
- Keyboard-accessible search across titles, summaries, tags, and lesson bodies
- Static generation for every lesson route

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production validation:

```bash
npm run lint
npm run typecheck
npm test
npm run validate:content
npm run build
npm start
```

## Architecture

```text
app/
  layout.tsx                 App shell and search index wiring
  page.tsx                   Learning dashboard
  learn/[slug]/page.tsx      Statically generated MDX lesson route
  reference/                 Architecture Reference Library under /reference
    page.tsx                 Hub (landscapes, matrices, failure walkthroughs)
    architecture/page.tsx    Layered explorer
    architecture/tokenx/     TokenX settlement explorer (`/reference/architecture/tokenx`)
    landscapes/[slug]/       Module landscapes
    technologies/[slug]/     Product deep dives
    failures/[id]/           Named failure walkthroughs
    guides/[slug]/           Interview selection guides (`/reference/guides/[slug]`)
components/
  app-shell.tsx              Responsive sidebar, header, and search dialog
  lesson-components.tsx      MDX pedagogy component registry
  learning-interactions.tsx  Calculators, timelines, failure and architecture interactions
  mermaid-diagram.tsx        Client-side, accessible Mermaid renderer
  progress-provider.tsx      localStorage-backed completion state
content/lessons/             Git-versioned curriculum in MDX
content/architecture/        Library graph, deep dives, matrices, walkthroughs
lib/content.ts               Frontmatter parsing, catalog, and search text
lib/architecture.ts          Architecture library catalog loading
docs/                        Content contract and full curriculum roadmap
scripts/                     Automated lesson and Mermaid validation
tests/                       Node tests for the content contract
```

Server components read MDX from `content/lessons` and `content/architecture/` at build time. `lib/content.ts` builds the lesson catalog; `lib/architecture.ts` loads the library graph, matrices, and walkthroughs for `/reference`. `generateStaticParams` pre-renders every lesson. The root layout sends only serializable lesson metadata and normalized search text to the client. Search has no external service or runtime network dependency.

MDX expressions are enabled only for trusted, repository-owned lesson files so structured component props such as quiz options and Mermaid definitions can compile. Dangerous JavaScript globals remain blocked, and user-provided MDX is never evaluated.

Progress is stored under `sda:completed-lessons:v1` in `localStorage`. Clearing browser storage resets progress. This is intentionally device-local for V1.

Mermaid is dynamically imported only when a lesson diagram mounts, keeping it out of the initial dashboard path.

Phase 0 quality hardening is complete for the seven foundation lessons. Phase 1A completes all nine Storage & Data lessons and all nine CAP & Consistency lessons. Modules 2–7 are complete. The academy contains 64 of 64 planned lessons. Implemented lessons include explicit state ownership, consistency boundaries, failure/recovery paths, challenging scenario checks, and practical TokenX or Ad Click Aggregator reasoning.

The Architecture Reference Library is on `main` at `f4267dd` under `/reference` (hub, explorer, landscapes, matrices, failure walkthroughs). The production alias [https://system-design-academy-lemon.vercel.app](https://system-design-academy-lemon.vercel.app) matched that commit as of 29 Oct 2026 (GitHub Vercel status on SHA `f4267dd`, deployment `8sJMip4uxTCvqtEWSz3dK4WyEHBX`, plus live HTML; not a Vercel API alias binding). This Phase C branch is not a new production deploy. Plan: [docs/phase-2-architecture-reference.md](docs/phase-2-architecture-reference.md).

## Authoring content

Read [docs/content-standards.md](docs/content-standards.md) before adding a lesson. Every lesson must include the nine required sections, a diagram, trade-off analysis, a knowledge check, and an interview-ready answer.

1. Add `content/lessons/<stable-slug>.mdx`.
2. Complete all required frontmatter. The module number controls navigation order.
3. Use the exported MDX components shown in the existing lessons.
4. Add or update the topic status in [docs/learning-roadmap.md](docs/learning-roadmap.md).
5. Run `npm run validate:content`. It checks frontmatter, required section order, quiz counts, and Mermaid syntax.
6. Run lint, type checking, tests, and a production build.

Content remains independent of page components. Do not hard-code lesson prose in `app` or `components`.

## Deploying to Vercel

No environment variables or managed services are required.

1. Import the Git repository into Vercel.
2. Select the Next.js framework preset.
3. Keep the defaults: install command `npm install`, build command `npm run build`, and output managed by Next.js.
4. Deploy, then verify the dashboard, one lesson, Mermaid rendering, search, and progress persistence.

For CLI deployment, install and authenticate the Vercel CLI, then run `vercel` for a preview and `vercel --prod` only after review. Production matched `main` `f4267dd` as of 29 Oct 2026 (GitHub Vercel status plus live HTML; not a Vercel API alias binding). This Phase C branch is not a new production deploy.

## V1 boundaries

Progress does not sync across browsers, quiz attempts are not persisted, and there is no authoring CMS. Those are deliberate trade-offs that keep V1 hostable without a backend. A future authenticated version can replace the progress store behind the existing context API while preserving MDX as the curriculum source.
