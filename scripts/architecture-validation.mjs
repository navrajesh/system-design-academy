import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractMermaidCharts } from "./content-validation.mjs";

export const LIBRARY_DEEP_DIVE_SECTIONS = [
  "LibraryBigPicture",
  "LibraryUnderTheHood",
  "ArchitectureAndDataFlow",
  "SelectionCriteria",
  "FailureModes",
  "LibraryInterviewTraps",
  "LibraryMentalModel",
];

export const LIBRARY_GUIDE_SECTIONS = [
  "NonNegotiable",
  "Options",
  "InvalidatingFailure",
  "OperationalBurden",
  "LessonLinks",
];

/** Must match SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID in lib/architecture-types.ts */
export const SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID = "settlement-succeeds-indexer-fails";
export const SETTLEMENT_GRAPH_RELATIVE_PATH = "graphs/tokenx-settlement.json";

export const MATRIX_COLUMN_IDS = [
  "workload",
  "consistency",
  "latency",
  "scaling",
  "failure",
  "costOps",
  "whenNot",
];

const REQUIRED_LAYERS = ["client", "edge", "ingress", "compute", "cache", "primary", "streaming", "object", "observe"];
const FAILOVER_STEPS = ["normal", "detection", "in-flight", "promotion", "client-retry", "consistency", "recovery", "user-visible"];
const OWNERSHIP = new Set(["authoritative", "derived"]);
const EDGE_KIND = new Set(["sync", "async"]);
const FORBIDDEN_CLAIM = /instantaneous failover|lossless failover|transparent failover|failover is instantaneous|instantaneous failover is lossless|linearizable by default/i;
export const PHASE_A_SLUGS = [
  "relational-vs-nosql-selection",
  "indexes-and-query-execution",
  "caching-patterns-and-invalidation",
  "replication-and-failover",
  "transactions-across-boundaries",
];

export const LANDSCAPE_REQUIRED_SLUGS = {
  storage: PHASE_A_SLUGS,
  scalability: [
    "load-balancing-deep-dive",
    "scaling-read-heavy-services",
    "write-scaling",
    "autoscaling-and-capacity-planning",
    "fan-out-architectures",
  ],
  "kafka-fault-tolerance": [
    "kafka-internals",
    "kafka-delivery-and-failure",
    "consumer-groups-and-rebalancing",
    "retries-dead-letters-and-replay",
    "stream-processing-and-windows",
  ],
  performance: [
    "latency-throughput-and-queues",
    "caching-patterns-and-invalidation",
    "tail-latency-control",
    "performance-budgets-and-slos",
    "backpressure-and-overload",
  ],
  networking: [
    "dns-and-service-discovery",
    "tcp-quic-and-connection-lifecycle",
    "http-apis-and-protocol-choice",
    "network-security-boundaries",
    "service-mesh-and-proxies",
  ],
  consistency: [
    "cap-and-consistency-models",
    "consensus-and-leader-election",
    "distributed-locks-and-leases",
    "distributed-transactions",
    "idempotency-and-deduplication",
  ],
  composition: [
    "design-tokenx",
    "design-an-ad-click-aggregator",
    "driving-a-system-design-interview",
    "architecture-review-practice",
    "graceful-degradation",
  ],
};

export const REQUIRED_LIBRARY_FILES = [
  "graph.json",
  "catalog.json",
  "summaries.json",
  "landscapes/storage.mdx",
  "landscapes/scalability.mdx",
  "landscapes/kafka-fault-tolerance.mdx",
  "landscapes/performance.mdx",
  "landscapes/networking.mdx",
  "landscapes/consistency.mdx",
  "landscapes/composition.mdx",
  "technologies/postgresql.mdx",
  "technologies/redis.mdx",
  "technologies/dynamodb.mdx",
  "matrices/postgres-dynamodb-cassandra.json",
  "matrices/cache-replica-cdn.json",
  "matrices/lb-gateway-k8s.json",
  "matrices/kafka-streams-flink.json",
  "matrices/http-grpc-mesh.json",
  "matrices/consensus-quorum-crdt.json",
  "matrices/tokenx-ads-chat.json",
  "failures/database-failover.json",
  "failures/cache-outage.json",
  "failures/kafka-consumer-lag.json",
  "failures/network-partition.json",
  "failures/overload.json",
  "failures/multi-region-failure.json",
];

export function extractLessonCrossLinkSlugs(content) {
  return [...content.matchAll(/<LessonCrossLink\b[^>]*\bslug="([^"]+)"/g)].map((match) => match[1]);
}

export function extractLibraryMermaid(content) {
  const charts = [];
  const pattern = /<MermaidDiagram\b[\s\S]*?\bchart=\{("(?:\\.|[^"\\])*")\}/g;
  for (const match of content.matchAll(pattern)) {
    try {
      charts.push(JSON.parse(match[1]));
    } catch {
      charts.push(null);
    }
  }
  return charts;
}

function lessonSlugSet(lessonsDirectory) {
  if (!lessonsDirectory || !fs.existsSync(lessonsDirectory)) return new Set();
  return new Set(fs.readdirSync(lessonsDirectory).filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, "")));
}

export function validateArchitectureGraph(graph, knownSlugs = new Set()) {
  const errors = [];
  if (!graph || typeof graph !== "object") return ["graph.json: must be an object"];
  if (!graph.id || !graph.title || !graph.description) errors.push("graph.json: missing id, title, or description");
  if (!Array.isArray(graph.assumptions) || !graph.assumptions.length) errors.push("graph.json: assumptions required");
  const layerIds = new Set((graph.layers ?? []).map((layer) => layer.id));
  for (const id of REQUIRED_LAYERS) {
    if (!layerIds.has(id)) errors.push("graph.json: missing required layer '" + id + "'");
  }
  const nodeIds = new Set();
  for (const node of graph.nodes ?? []) {
    if (!node?.id) {
      errors.push("graph.json: node missing id");
      continue;
    }
    if (nodeIds.has(node.id)) errors.push("graph.json: duplicate node '" + node.id + "'");
    nodeIds.add(node.id);
    if (node.ownership && !OWNERSHIP.has(node.ownership)) errors.push("graph.json: node '" + node.id + "' invalid ownership");
    for (const slug of node.relatedSlugs ?? []) {
      if (knownSlugs.size && !knownSlugs.has(slug)) errors.push("graph.json: node '" + node.id + "' unknown lesson slug '" + slug + "'");
    }
    if (node.detail && ["consistency", "durability", "failure", "recovery"].some((field) => !node.detail[field])) {
      errors.push("graph.json: node '" + node.id + "' detail must name consistency, durability, failure, and recovery");
    }
  }
  for (const edge of graph.edges ?? []) {
    if (!EDGE_KIND.has(edge.kind)) errors.push("graph.json: edge '" + edge.id + "' kind must be sync or async");
    if (edge.from && nodeIds.size && !nodeIds.has(edge.from)) errors.push("graph.json: edge '" + edge.id + "' unknown from");
    if (edge.to && nodeIds.size && !nodeIds.has(edge.to)) errors.push("graph.json: edge '" + edge.id + "' unknown to");
  }
  return errors;
}

function validateGraphNodesAndEdges(graph, filename, knownSlugs, errors) {
  const nodeIds = new Set();
  if (!Array.isArray(graph.nodes) || !graph.nodes.length) errors.push(filename + ": nodes required");
  for (const node of graph.nodes ?? []) {
    if (!node?.id) {
      errors.push(filename + ": node missing id");
      continue;
    }
    if (nodeIds.has(node.id)) errors.push(filename + ": duplicate node '" + node.id + "'");
    nodeIds.add(node.id);
    if (!OWNERSHIP.has(node.ownership)) errors.push(filename + ": node '" + node.id + "' ownership must be authoritative or derived");
    if (!node.detail || ["consistency", "durability", "failure", "recovery"].some((field) => !node.detail[field])) {
      errors.push(filename + ": node '" + node.id + "' detail must name consistency, durability, failure, and recovery");
    }
    for (const slug of node.relatedSlugs ?? []) {
      if (knownSlugs.size && !knownSlugs.has(slug)) errors.push(filename + ": node '" + node.id + "' unknown lesson slug '" + slug + "'");
    }
  }
  for (const edge of graph.edges ?? []) {
    if (!EDGE_KIND.has(edge.kind)) errors.push(filename + ": edge '" + (edge.id ?? "?") + "' kind must be sync or async");
    if (edge.from && nodeIds.size && !nodeIds.has(edge.from)) errors.push(filename + ": edge '" + (edge.id ?? "?") + "' unknown from");
    if (edge.to && nodeIds.size && !nodeIds.has(edge.to)) errors.push(filename + ": edge '" + (edge.id ?? "?") + "' unknown to");
  }
  return nodeIds;
}

export function validateSettlementGraph(graph, filename = SETTLEMENT_GRAPH_RELATIVE_PATH, knownSlugs = new Set()) {
  const errors = [];
  if (!graph || typeof graph !== "object") return [filename + ": must be an object"];
  if (!graph.id || !graph.title || !graph.description) errors.push(filename + ": missing id, title, or description");
  if (!Array.isArray(graph.assumptions) || !graph.assumptions.length) errors.push(filename + ": assumptions required");
  if (!Array.isArray(graph.layers) || !graph.layers.length) errors.push(filename + ": layers required");
  const nodeIds = validateGraphNodesAndEdges(graph, filename, knownSlugs, errors);
  if (FORBIDDEN_CLAIM.test(JSON.stringify(graph ?? {}))) {
    errors.push(filename + ": must not claim instantaneous, lossless, or transparent failover, or linearizable-by-default");
  }
  const scenarios = graph.scenarios ?? [];
  if (!Array.isArray(scenarios) || !scenarios.length) {
    errors.push(filename + ": scenarios required");
  } else if (!scenarios.some((scenario) => scenario?.id === SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID)) {
    errors.push(filename + ": missing required scenario '" + SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID + "'");
  }
  const scenarioIds = new Set();
  for (const scenario of scenarios) {
    if (!scenario?.id) {
      errors.push(filename + ": scenario missing id");
      continue;
    }
    if (scenarioIds.has(scenario.id)) errors.push(filename + ": duplicate scenario '" + scenario.id + "'");
    scenarioIds.add(scenario.id);
    if (!scenario.title || !scenario.summary || !scenario.callout) {
      errors.push(filename + ": scenario '" + scenario.id + "' needs title, summary, and callout");
    }
    if (!Array.isArray(scenario.highlightedNodeIds) || !scenario.highlightedNodeIds.length) {
      errors.push(filename + ": scenario '" + scenario.id + "' highlightedNodeIds required");
    }
    for (const id of scenario.highlightedNodeIds ?? []) {
      if (nodeIds.size && !nodeIds.has(id)) errors.push(filename + ": scenario '" + scenario.id + "' unknown highlighted node '" + id + "'");
    }
    for (const id of scenario.dimmedNodeIds ?? []) {
      if (nodeIds.size && !nodeIds.has(id)) errors.push(filename + ": scenario '" + scenario.id + "' unknown dimmed node '" + id + "'");
    }
  }
  return errors;
}

function assertSectionOrder(content, sections, filename, errors) {
  let previousIndex = -1;
  for (const section of sections) {
    const matches = [...content.matchAll(new RegExp("<" + section + "(?:\\s|>)", "g"))];
    if (!matches.length) {
      errors.push(filename + ": missing required library section <" + section + ">");
      continue;
    }
    const index = matches[0].index ?? -1;
    if (index < previousIndex) errors.push(filename + ": <" + section + "> is out of required library order");
    previousIndex = Math.max(previousIndex, index);
    if (matches.length !== 1) errors.push(filename + ": expected exactly one <" + section + ">, found " + matches.length);
  }
}

export function validateDeepDiveText(raw, filename = "deep-dive.mdx") {
  const errors = [];
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    return { errors: [filename + ": invalid frontmatter (" + error.message + ")"], data: {}, content: "", charts: [] };
  }
  const { data, content } = parsed;
  for (const field of ["kind", "title", "description", "landscape"]) {
    if (data[field] === undefined || data[field] === "") errors.push(filename + ": missing frontmatter field '" + field + "'");
  }
  if (data.kind && data.kind !== "deep-dive") errors.push(filename + ": kind must be deep-dive");
  if (!Array.isArray(data.relatedSlugs)) errors.push(filename + ": relatedSlugs must be an array");
  if (content.includes("<KnowledgeCheck")) errors.push(filename + ": library pages must not include <KnowledgeCheck>");
  if (content.includes("<InterviewAnswer")) errors.push(filename + ": library pages must not include <InterviewAnswer>");
  let previousIndex = -1;
  for (const section of LIBRARY_DEEP_DIVE_SECTIONS) {
    const matches = [...content.matchAll(new RegExp("<" + section + "(?:\\s|>)", "g"))];
    if (!matches.length) {
      errors.push(filename + ": missing required library section <" + section + ">");
      continue;
    }
    const index = matches[0].index ?? -1;
    if (index < previousIndex) errors.push(filename + ": <" + section + "> is out of required library order");
    previousIndex = Math.max(previousIndex, index);
    if (matches.length !== 1) errors.push(filename + ": expected exactly one <" + section + ">, found " + matches.length);
  }
  if (FORBIDDEN_CLAIM.test(content)) errors.push(filename + ": must not claim instantaneous, lossless, or transparent failover, or linearizable-by-default");
  const charts = [...extractLibraryMermaid(content), ...extractMermaidCharts(content)].filter((chart) => chart !== undefined);
  return { errors, data, content, charts };
}

export function validateMatrix(matrix, filename = "matrix.json", knownSlugs = new Set()) {
  const errors = [];
  if (!matrix?.id || !matrix?.title) errors.push(filename + ": missing id or title");
  if (!Array.isArray(matrix?.assumptions) || !matrix.assumptions.length) errors.push(filename + ": assumptions footnote required");
  const columnIds = new Set((matrix?.columns ?? []).map((column) => column.id));
  for (const id of MATRIX_COLUMN_IDS) {
    if (!columnIds.has(id)) errors.push(filename + ": missing required column '" + id + "'");
  }
  if (!Array.isArray(matrix?.rows) || matrix.rows.length < 2) errors.push(filename + ": at least two rows required");
  for (const row of matrix?.rows ?? []) {
    for (const id of MATRIX_COLUMN_IDS) {
      if (!row.cells?.[id]) errors.push(filename + ": row '" + (row.id ?? "?") + "' missing cell '" + id + "'");
    }
  }
  for (const slug of matrix?.relatedSlugs ?? []) {
    if (knownSlugs.size && !knownSlugs.has(slug)) errors.push(filename + ": unknown related slug '" + slug + "'");
  }
  if (FORBIDDEN_CLAIM.test(JSON.stringify(matrix ?? {}))) errors.push(filename + ": must not claim instantaneous/lossless failover");
  return errors;
}

export function validateFailover(walkthrough, filename = "walkthrough.json", knownSlugs = new Set()) {
  const errors = [];
  if (!walkthrough?.id || !walkthrough?.title) errors.push(filename + ": missing id or title");
  if (!Array.isArray(walkthrough?.assumptions) || !walkthrough.assumptions.length) errors.push(filename + ": assumptions required");
  const ids = new Set((walkthrough?.steps ?? []).map((step) => step.id));
  for (const id of FAILOVER_STEPS) {
    if (!ids.has(id)) errors.push(filename + ": missing required step '" + id + "'");
  }
  for (const step of walkthrough?.steps ?? []) {
    for (const field of ["title", "timeline", "inFlight", "consistency", "durability", "userVisible", "recovery"]) {
      if (!step[field]) errors.push(filename + ": step '" + step.id + "' missing " + field);
    }
  }
  if (FORBIDDEN_CLAIM.test(JSON.stringify(walkthrough ?? {}))) {
    errors.push(filename + ": must not claim instantaneous, lossless, or transparent failover");
  }
  for (const slug of walkthrough?.relatedSlugs ?? []) {
    if (knownSlugs.size && !knownSlugs.has(slug)) errors.push(filename + ": unknown related slug '" + slug + "'");
  }
  return errors;
}

export function validateLandscapeText(raw, filename, knownSlugs = new Set()) {
  const errors = [];
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    return { errors: [filename + ": invalid frontmatter (" + error.message + ")"] };
  }
  const { data, content } = parsed;
  if (data.kind !== "landscape") errors.push(filename + ": kind must be landscape");
  for (const field of ["title", "description", "landscape"]) {
    if (!data[field]) errors.push(filename + ": missing frontmatter field '" + field + "'");
  }
  const slugs = new Set([...(data.relatedSlugs ?? []), ...extractLessonCrossLinkSlugs(content)]);
  const requiredSlugs = LANDSCAPE_REQUIRED_SLUGS[data.landscape] ?? PHASE_A_SLUGS;
  for (const slug of requiredSlugs) {
    if (!slugs.has(slug)) errors.push(filename + ": must LessonCrossLink '" + slug + "'");
  }
  for (const slug of slugs) {
    if (knownSlugs.size && !knownSlugs.has(slug)) errors.push(filename + ": unknown related slug '" + slug + "'");
  }
  if (content.includes("<KnowledgeCheck")) errors.push(filename + ": library pages must not include <KnowledgeCheck>");
  return { errors, data, content };
}

export function validateGuideText(raw, filename = "guide.mdx", knownSlugs = new Set()) {
  const errors = [];
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    return { errors: [filename + ": invalid frontmatter (" + error.message + ")"], data: {}, content: "", charts: [] };
  }
  const { data, content } = parsed;
  for (const field of ["kind", "title", "description"]) {
    if (data[field] === undefined || data[field] === "") errors.push(filename + ": missing frontmatter field '" + field + "'");
  }
  if (data.kind && data.kind !== "guide") errors.push(filename + ": kind must be guide");
  if (!Array.isArray(data.relatedSlugs)) errors.push(filename + ": relatedSlugs must be an array");
  if (content.includes("<KnowledgeCheck")) errors.push(filename + ": library pages must not include <KnowledgeCheck>");
  if (content.includes("<InterviewAnswer")) errors.push(filename + ": library pages must not include <InterviewAnswer>");
  assertSectionOrder(content, LIBRARY_GUIDE_SECTIONS, filename, errors);
  if (FORBIDDEN_CLAIM.test(content)) {
    errors.push(filename + ": must not claim instantaneous, lossless, or transparent failover, or linearizable-by-default");
  }
  const slugs = new Set([...(data.relatedSlugs ?? []), ...extractLessonCrossLinkSlugs(content)]);
  for (const slug of slugs) {
    if (knownSlugs.size && !knownSlugs.has(String(slug))) errors.push(filename + ": unknown related slug '" + slug + "'");
  }
  const charts = [...extractLibraryMermaid(content), ...extractMermaidCharts(content)].filter((chart) => chart !== undefined);
  return { errors, data, content, charts };
}

export async function validateArchitectureLibrary({ architectureDirectory, lessonsDirectory }) {
  const errors = [];
  const knownSlugs = lessonSlugSet(lessonsDirectory);
  const charts = [];
  const deepDiveFiles = [];

  for (const relative of REQUIRED_LIBRARY_FILES) {
    if (!fs.existsSync(path.join(architectureDirectory, relative))) {
      errors.push("library missing required file content/architecture/" + relative);
    }
  }

  const graphPath = path.join(architectureDirectory, "graph.json");
  if (fs.existsSync(graphPath)) {
    try {
      errors.push(...validateArchitectureGraph(JSON.parse(fs.readFileSync(graphPath, "utf8")), knownSlugs));
    } catch (error) {
      errors.push("graph.json: invalid JSON (" + error.message + ")");
    }
  }

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

  const techDir = path.join(architectureDirectory, "technologies");
  if (fs.existsSync(techDir)) {
    for (const file of fs.readdirSync(techDir).filter((name) => name.endsWith(".mdx")).sort()) {
      deepDiveFiles.push(file);
      const result = validateDeepDiveText(fs.readFileSync(path.join(techDir, file), "utf8"), file);
      errors.push(...result.errors);
      for (const slug of result.data.relatedSlugs ?? []) {
        if (knownSlugs.size && !knownSlugs.has(String(slug))) errors.push(file + ": unknown related slug '" + slug + "'");
      }
      for (const chart of result.charts) {
        if (chart === null) {
          errors.push(file + ": Mermaid chart must be a valid JSON string expression");
          continue;
        }
        charts.push(chart);
        try {
          await mermaid.parse(chart, { suppressErrors: true });
        } catch (error) {
          errors.push(file + ": Mermaid diagram failed to parse (" + error.message + ")");
        }
      }
    }
  }

  const landscapesDir = path.join(architectureDirectory, "landscapes");
  if (fs.existsSync(landscapesDir)) {
    for (const file of fs.readdirSync(landscapesDir).filter((name) => name.endsWith(".mdx"))) {
      const result = validateLandscapeText(
        fs.readFileSync(path.join(landscapesDir, file), "utf8"),
        "landscapes/" + file,
        knownSlugs,
      );
      errors.push(...result.errors);
    }
  }

  const matricesDir = path.join(architectureDirectory, "matrices");
  if (fs.existsSync(matricesDir)) {
    for (const file of fs.readdirSync(matricesDir).filter((name) => name.endsWith(".json"))) {
      errors.push(...validateMatrix(JSON.parse(fs.readFileSync(path.join(matricesDir, file), "utf8")), file, knownSlugs));
    }
  }

  const failuresDir = path.join(architectureDirectory, "failures");
  if (fs.existsSync(failuresDir)) {
    for (const file of fs.readdirSync(failuresDir).filter((name) => name.endsWith(".json"))) {
      errors.push(
        ...validateFailover(JSON.parse(fs.readFileSync(path.join(failuresDir, file), "utf8")), file, knownSlugs),
      );
    }
  }

  const settlementPath = path.join(architectureDirectory, SETTLEMENT_GRAPH_RELATIVE_PATH);
  if (fs.existsSync(settlementPath)) {
    try {
      errors.push(
        ...validateSettlementGraph(JSON.parse(fs.readFileSync(settlementPath, "utf8")), SETTLEMENT_GRAPH_RELATIVE_PATH, knownSlugs),
      );
    } catch (error) {
      errors.push(SETTLEMENT_GRAPH_RELATIVE_PATH + ": invalid JSON (" + error.message + ")");
    }
  }

  const guidesDir = path.join(architectureDirectory, "guides");
  if (fs.existsSync(guidesDir)) {
    for (const file of fs.readdirSync(guidesDir).filter((name) => name.endsWith(".mdx")).sort()) {
      const result = validateGuideText(fs.readFileSync(path.join(guidesDir, file), "utf8"), "guides/" + file, knownSlugs);
      errors.push(...result.errors);
      for (const chart of result.charts ?? []) {
        if (chart === null) {
          errors.push("guides/" + file + ": Mermaid chart must be a valid JSON string expression");
          continue;
        }
        charts.push(chart);
        try {
          await mermaid.parse(chart, { suppressErrors: true });
        } catch (error) {
          errors.push("guides/" + file + ": Mermaid diagram failed to parse (" + error.message + ")");
        }
      }
    }
  }

  const catalogPath = path.join(architectureDirectory, "catalog.json");
  if (fs.existsSync(catalogPath)) {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    const available = (catalog.landscapes ?? []).filter((item) => item.status === "available");
    if (available.length !== 7) errors.push("catalog.json: expected 7 available landscapes, found " + available.length);
    const failureIds = new Set((catalog.failures ?? []).map((item) => item.id));
    for (const id of [
      "database-failover",
      "cache-outage",
      "kafka-consumer-lag",
      "network-partition",
      "overload",
      "multi-region-failure",
    ]) {
      if (!failureIds.has(id)) errors.push("catalog.json: missing failure '" + id + "'");
    }
  }

  const summariesPath = path.join(architectureDirectory, "summaries.json");
  if (fs.existsSync(summariesPath)) {
    const summaries = JSON.parse(fs.readFileSync(summariesPath, "utf8"));
    const requiredProducts = ["MySQL", "MongoDB", "Cassandra", "OpenSearch", "S3"];
    const titles = new Set(summaries.map((item) => item.product ?? item.title));
    for (const product of requiredProducts) {
      if (![...titles].some((title) => String(title).includes(product))) errors.push("summaries.json: missing " + product);
    }
  }

  return { errors, deepDiveFiles, charts };
}
