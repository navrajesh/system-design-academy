import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  extractLessonCrossLinkSlugs,
  validateArchitectureGraph,
  validateDeepDiveText,
  validateMatrix,
  validateFailover,
  LIBRARY_DEEP_DIVE_SECTIONS,
  MATRIX_COLUMN_IDS,
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
      assumptions: ["sync commit on primary"],
      relatedSlugs: ["replication-and-failover"],
      steps: ids.map((id) => ({ id, ...step })),
    },
    "database-failover.json",
    known,
  );
  assert.deepEqual(ok, []);
  const bad = validateFailover(
    {
      id: "database-failover",
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
