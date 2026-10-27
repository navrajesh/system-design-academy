import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { extractMermaidCharts, validateLessonText } from "../scripts/content-validation.mjs";

const frontmatter = [
  "---",
  'title: "Test Lesson"',
  'description: "A complete validation fixture."',
  "module: 1",
  'moduleTitle: "Storage & Data"',
  "order: 1",
  "duration: 35",
  'difficulty: "Intermediate"',
  "tags: [one, two, three]",
  'objectives: ["Explain one", "Defend two"]',
  "---",
  "",
].join("\n");

const sections = [
  "<BigPicture>Why it matters.</BigPicture>",
  "<UnderTheHood>Mechanism.</UnderTheHood>",
  "<MentalModel>Analogy.</MentalModel>",
  '<ArchitectureDiagram title="Test" chart={"flowchart LR\\n A --> B"}>A owns state; B recovers.</ArchitectureDiagram>',
  "<RealExamples>Example one. Example two.</RealExamples>",
  "<InterviewTraps>Follow-up.</InterviewTraps>",
  "<Tradeoffs>Trade-off.</Tradeoffs>",
  '<KnowledgeCheck question="Question?" options={["A", "B"]} correct={0} explanation="Because." />',
  '<ScenarioCheck scenario="Failure" question="Respond?" options={[{label: "A", feedback: "Good"}]} correct={0} explanation="Because." />',
  "<InterviewAnswer>Answer.</InterviewAnswer>",
  "",
].join("\n");

test("accepts a structurally complete long lesson", () => {
  const result = validateLessonText(frontmatter + sections, "valid.mdx");
  assert.deepEqual(result.errors, []);
  assert.equal(result.charts.length, 1);
});

test("rejects missing frontmatter, missing sections, and too few long-lesson checks", () => {
  const invalid = frontmatter
    .replace("tags: [one, two, three]\n", "")
    + sections
      .replace("<UnderTheHood>Mechanism.</UnderTheHood>\n", "")
      .replace(/<ScenarioCheck[^\n]+\n/, "");
  const result = validateLessonText(invalid, "invalid.mdx");
  assert.ok(result.errors.some((error) => error.includes("missing frontmatter field 'tags'")));
  assert.ok(result.errors.some((error) => error.includes("missing required section <UnderTheHood>")));
  assert.ok(result.errors.some((error) => error.includes("at least two checks")));
});

test("extracts escaped Mermaid source from MDX props", () => {
  assert.deepEqual(
    extractMermaidCharts('<ArchitectureDiagram chart={"flowchart LR\\n A --> B"}>Text</ArchitectureDiagram>'),
    ["flowchart LR\n A --> B"],
  );
});

test("Module 1 contains the exact nine-topic roadmap inventory", async () => {
  const expected = [
    "Partitioning vs Sharding vs Aggregation",
    "Relational vs NoSQL Selection",
    "Data Modeling from Access Patterns",
    "Indexes and Query Execution",
    "Replication and Failover",
    "Time-Series and Append-Only Storage",
    "Object Storage and Large Files",
    "Transactions Across Boundaries",
    "Backup, Restore, and Disaster Recovery",
  ];
  const lessonDirectory = path.join(process.cwd(), "content", "lessons");
  const files = (await readdir(lessonDirectory)).filter((file) => file.endsWith(".mdx"));
  const lessons = await Promise.all(
    files.map(async (file) => matter(await readFile(path.join(lessonDirectory, file), "utf8")).data),
  );
  const moduleOneTitles = lessons
    .filter((lesson) => lesson.module === 1)
    .sort((left, right) => left.order - right.order)
    .map((lesson) => lesson.title);

  assert.deepEqual(moduleOneTitles, expected);
});

test("Module 2 contains the exact eight-topic roadmap inventory", async () => {
  const expected = [
    "Scaling Read-Heavy Services",
    "Load Balancing Deep Dive",
    "Caching Patterns and Invalidation",
    "Write Scaling",
    "Autoscaling and Capacity Planning",
    "Fan-out Architectures",
    "Multi-Region Design",
    "Migration at Scale",
  ];
  const lessonDirectory = path.join(process.cwd(), "content", "lessons");
  const files = (await readdir(lessonDirectory)).filter((file) => file.endsWith(".mdx"));
  const lessons = await Promise.all(
    files.map(async (file) => matter(await readFile(path.join(lessonDirectory, file), "utf8")).data),
  );
  const moduleTwoTitles = lessons
    .filter((lesson) => lesson.module === 2)
    .sort((left, right) => left.order - right.order)
    .map((lesson) => lesson.title);

  assert.deepEqual(moduleTwoTitles, expected);
});

test("Module 6 contains the exact nine-topic roadmap inventory", async () => {
  const expected = [
    "CAP & Practical Consistency",
    "Consistency Models",
    "Consensus and Leader Election",
    "Distributed Transactions",
    "Conflict Resolution",
    "Distributed Locks and Leases",
    "Time and Ordering",
    "Idempotency and Deduplication",
    "Consistency Testing",
  ];
  const lessonDirectory = path.join(process.cwd(), "content", "lessons");
  const files = (await readdir(lessonDirectory)).filter((file) => file.endsWith(".mdx"));
  const lessons = await Promise.all(
    files.map(async (file) => matter(await readFile(path.join(lessonDirectory, file), "utf8")).data),
  );
  const moduleSixTitles = lessons
    .filter((lesson) => lesson.module === 6)
    .sort((left, right) => left.order - right.order)
    .map((lesson) => lesson.title);

  assert.deepEqual(moduleSixTitles, expected);
});
