import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  extractLessonCrossLinkSlugs,
  validateArchitectureGraph,
  validateDeepDiveText,
  validateGuideText,
  validateMatrix,
  validateFailover,
  validateSettlementGraph,
  LIBRARY_DEEP_DIVE_SECTIONS,
  LIBRARY_GUIDE_SECTIONS,
  MATRIX_COLUMN_IDS,
  REQUIRED_LIBRARY_FILES,
  SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID,
  SETTLEMENT_GRAPH_RELATIVE_PATH,
} from "../scripts/architecture-validation.mjs";
import { REQUIRED_SECTIONS } from "../scripts/content-validation.mjs";

const known = new Set([
  "relational-vs-nosql-selection",
  "indexes-and-query-execution",
  "caching-patterns-and-invalidation",
  "replication-and-failover",
  "transactions-across-boundaries",
]);

const deepDiveFrontmatter = [
  "---",
  "kind: deep-dive",
  'title: "PostgreSQL"',
  'description: "Library deep dive fixture."',
  "landscape: storage",
  "relatedSlugs: [relational-vs-nosql-selection]",
  "---",
  "",
].join("\n");

const deepDiveSections = LIBRARY_DEEP_DIVE_SECTIONS.map((section, index) =>
  index === 2
    ? `<${section}><MermaidDiagram title="Inset" chart={"flowchart LR\\n A --> B"} />Flow.</${section}>`
    : `<${section}>Section body.</${section}>`,
).join("\n");

test("library deep-dive contract is seven sections and is not the lesson nine-section contract", () => {
  assert.equal(LIBRARY_DEEP_DIVE_SECTIONS.length, 7);
  assert.ok(!LIBRARY_DEEP_DIVE_SECTIONS.includes("KnowledgeCheck"));
  assert.ok(!LIBRARY_DEEP_DIVE_SECTIONS.includes("InterviewAnswer"));
  assert.equal(REQUIRED_SECTIONS.length, 9);
});

test("accepts a structurally complete library deep dive", () => {
  const result = validateDeepDiveText(deepDiveFrontmatter + deepDiveSections, "postgresql.mdx");
  assert.deepEqual(result.errors, []);
});

test("rejects KnowledgeCheck and missing library sections", () => {
  const result = validateDeepDiveText(
    deepDiveFrontmatter + deepDiveSections.replace("<LibraryBigPicture>Section body.</LibraryBigPicture>\n", "") +
      '\n<KnowledgeCheck question="x" options={["A"]} correct={0} explanation="e" />\n',
    "bad.mdx",
  );
  assert.ok(result.errors.some((error) => error.includes("missing required library section <LibraryBigPicture>")));
  assert.ok(result.errors.some((error) => error.includes("must not include <KnowledgeCheck>")));
});

test("LessonCrossLink extraction fails closed on unknown slugs in graph validation", () => {
  assert.deepEqual(
    extractLessonCrossLinkSlugs('<p><LessonCrossLink slug="replication-and-failover" /> and <LessonCrossLink slug="missing-slug" /></p>'),
    ["replication-and-failover", "missing-slug"],
  );
  const errors = validateArchitectureGraph(
    {
      version: 1,
      id: "g",
      title: "t",
      description: "d",
      assumptions: ["a"],
      layers: [
        { id: "client" }, { id: "edge" }, { id: "ingress" }, { id: "compute" }, { id: "cache" },
        { id: "primary" }, { id: "streaming" }, { id: "object" }, { id: "observe" },
      ],
      nodes: [
        {
          id: "n1",
          layerId: "client",
          ownership: "derived",
          relatedSlugs: ["not-a-real-lesson"],
          detail: { consistency: "c", durability: "d", failure: "f", recovery: "r" },
        },
      ],
      edges: [],
    },
    known,
  );
  assert.ok(errors.some((error) => error.includes("unknown lesson slug 'not-a-real-lesson'")));
});

test("matrices require property columns and assumption footnotes", () => {
  const errors = validateMatrix(
    {
      id: "engines",
      title: "Engines",
      assumptions: ["single region"],
      columns: MATRIX_COLUMN_IDS.map((id) => ({ id, label: id })),
      rows: [
        { id: "pg", product: "PostgreSQL", cells: Object.fromEntries(MATRIX_COLUMN_IDS.map((id) => [id, "x"])) },
        { id: "ddb", product: "DynamoDB", cells: Object.fromEntries(MATRIX_COLUMN_IDS.map((id) => [id, "y"])) },
      ],
      relatedSlugs: ["relational-vs-nosql-selection"],
    },
    "engines.json",
    known,
  );
  assert.deepEqual(errors, []);
  const missing = validateMatrix({ id: "x", title: "t", columns: [], rows: [] }, "bad.json", known);
  assert.ok(missing.some((error) => error.includes("assumptions footnote required")));
  assert.ok(missing.some((error) => error.includes("missing required column")));
});

test("failover walkthrough requires named steps and rejects lossless slogans", () => {
  const step = {
    title: "t",
    timeline: "tl",
    inFlight: "if",
    consistency: "c",
    durability: "d",
    userVisible: "u",
    recovery: "r",
  };
  const ids = ["normal", "detection", "in-flight", "promotion", "client-retry", "consistency", "recovery", "user-visible"];
  const ok = validateFailover(
    {
      id: "database-failover",
      title: "Primary failure",
      assumptions: ["sync commit on primary"],
      relatedSlugs: ["replication-and-failover"],
      steps: ids.map((id) => ({ id, ...step })),
    },
    "database-failover.json",
    known,
  );
  assert.deepEqual(ok, []);
  const named = validateFailover(
    {
      id: "cache-outage",
      title: "Cache outage",
      assumptions: ["cache is derived"],
      relatedSlugs: ["caching-patterns-and-invalidation"],
      steps: ids.map((id) => ({ id, ...step })),
    },
    "cache-outage.json",
    known,
  );
  assert.deepEqual(named, []);
  const bad = validateFailover(
    {
      id: "database-failover",
      title: "Primary failure",
      assumptions: ["x"],
      relatedSlugs: [],
      steps: ids.map((id) => ({ id, ...step, recovery: "instantaneous failover is lossless" })),
    },
    "database-failover.json",
    known,
  );
  assert.ok(bad.some((error) => error.includes("must not claim")));
});

test("curriculum still has exactly 64 lesson files and is not expanded by the library tree", async () => {
  const lessonDirectory = path.join(process.cwd(), "content", "lessons");
  const files = (await readdir(lessonDirectory)).filter((file) => file.endsWith(".mdx"));
  assert.equal(files.length, 64);
  const architectureLessons = (await readdir(lessonDirectory)).filter((file) => file.includes("architecture-reference"));
  assert.equal(architectureLessons.length, 0);
});

test("duplicate Phase 2 matrices are not required library files", () => {
  assert.ok(!REQUIRED_LIBRARY_FILES.includes("matrices/quorum-consensus-crdt.json"));
  assert.ok(!REQUIRED_LIBRARY_FILES.includes("matrices/tokenx-vs-ads.json"));
  assert.ok(REQUIRED_LIBRARY_FILES.includes("matrices/consensus-quorum-crdt.json"));
  assert.ok(REQUIRED_LIBRARY_FILES.includes("matrices/tokenx-ads-chat.json"));
  assert.equal(SETTLEMENT_GRAPH_RELATIVE_PATH, "graphs/tokenx-settlement.json");
  assert.equal(SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID, "settlement-succeeds-indexer-fails");
});

const settlementNode = {
  id: "ledger",
  layerId: "ledger",
  title: "Ledger",
  product: "TokenX ledger",
  ownership: "authoritative",
  optional: false,
  alternativeGroup: null,
  defaultSelected: true,
  paths: ["write"],
  relatedSlugs: ["transactions-across-boundaries"],
  href: null,
  summary: "Authoritative settlement rows.",
  detail: { consistency: "exclusive terminals", durability: "fsync before ack", failure: "UNKNOWN timeout", recovery: "idempotent lookup" },
};

const indexerNode = {
  ...settlementNode,
  id: "indexer",
  layerId: "derived",
  title: "Indexer",
  product: "Derived index",
  ownership: "derived",
  paths: ["read"],
  relatedSlugs: ["design-tokenx"],
  summary: "Rebuildable projection.",
  detail: { consistency: "lagging", durability: "rebuildable", failure: "ingest stall", recovery: "replay from ledger" },
};

function settlementGraph(overrides = {}) {
  return {
    version: 1,
    id: "tokenx-settlement",
    title: "TokenX settlement",
    description: "Ledger versus derived indexer.",
    assumptions: ["Settlement commit is not indexer freshness."],
    layers: [
      { id: "ledger", title: "Ledger", order: 1 },
      { id: "derived", title: "Derived", order: 2 },
    ],
    nodes: [settlementNode, indexerNode],
    edges: [{ id: "e-ledger-index", from: "ledger", to: "indexer", kind: "async", paths: ["write"], label: "Project" }],
    scenarios: [
      {
        id: SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID,
        title: "Settlement succeeds, indexer fails",
        summary: "The ledger commit stands while the derived index is stale.",
        highlightedNodeIds: ["ledger", "indexer"],
        dimmedNodeIds: [],
        callout: "Do not spend from the indexer.",
      },
    ],
    ...overrides,
  };
}

test("settlement graph does not require storage layers or failover steps", () => {
  const known = new Set(["transactions-across-boundaries", "design-tokenx"]);
  assert.deepEqual(validateSettlementGraph(settlementGraph(), SETTLEMENT_GRAPH_RELATIVE_PATH, known), []);
});

test("settlement graph requires the indexer-failure scenario and rejects slogans", () => {
  const known = new Set(["transactions-across-boundaries", "design-tokenx"]);
  const missing = validateSettlementGraph(settlementGraph({ scenarios: [] }), "tokenx-settlement.json", known);
  assert.ok(missing.some((error) => error.includes("scenarios required")));
  const wrongId = validateSettlementGraph(
    settlementGraph({
      scenarios: [
        {
          id: "other",
          title: "t",
          summary: "s",
          highlightedNodeIds: ["ledger"],
          callout: "c",
        },
      ],
    }),
    "tokenx-settlement.json",
    known,
  );
  assert.ok(wrongId.some((error) => error.includes(SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID)));
  const slogan = validateSettlementGraph(
    settlementGraph({ description: "linearizable by default after instantaneous failover" }),
    "tokenx-settlement.json",
    known,
  );
  assert.ok(slogan.some((error) => error.includes("must not claim")));
  const unknown = validateSettlementGraph(
    settlementGraph({
      nodes: [{ ...settlementNode, relatedSlugs: ["not-a-lesson"] }, indexerNode],
    }),
    "tokenx-settlement.json",
    known,
  );
  assert.ok(unknown.some((error) => error.includes("unknown lesson slug 'not-a-lesson'")));
});

const guideFrontmatter = [
  "---",
  "kind: guide",
  'title: "When to choose a quorum store"',
  'description: "Guide fixture."',
  "relatedSlugs: [cap-and-consistency-models]",
  "---",
  "",
].join("\n");

const guideSections = LIBRARY_GUIDE_SECTIONS.map((section, index) =>
  index === 1
    ? `<${section}><MermaidDiagram title="Tree" chart={"flowchart TD\\n A --> B"} />Options.</${section}>`
    : `<${section}>Section body.</${section}>`,
).join("\n");

test("interview guides require five sections in order and reject lesson checks", () => {
  const known = new Set(["cap-and-consistency-models"]);
  const ok = validateGuideText(guideFrontmatter + guideSections, "quorum.mdx", known);
  assert.deepEqual(ok.errors, []);
  assert.equal(LIBRARY_GUIDE_SECTIONS.length, 5);
  const badKind = validateGuideText(
    guideFrontmatter.replace("kind: guide", "kind: deep-dive") + guideSections,
    "bad.mdx",
    known,
  );
  assert.ok(badKind.errors.some((error) => error.includes("kind must be guide")));
  const reordered = validateGuideText(
    guideFrontmatter +
      LIBRARY_GUIDE_SECTIONS.slice()
        .reverse()
        .map((section) => `<${section}>Body.</${section}>`)
        .join("\n"),
    "order.mdx",
    known,
  );
  assert.ok(reordered.errors.some((error) => error.includes("out of required library order")));
  const banned = validateGuideText(
    guideFrontmatter +
      guideSections +
      '\n<KnowledgeCheck question="x" options={["A"]} correct={0} explanation="e" />\n<InterviewAnswer>no</InterviewAnswer>\n',
    "banned.mdx",
    known,
  );
  assert.ok(banned.errors.some((error) => error.includes("must not include <KnowledgeCheck>")));
  assert.ok(banned.errors.some((error) => error.includes("must not include <InterviewAnswer>")));
});
