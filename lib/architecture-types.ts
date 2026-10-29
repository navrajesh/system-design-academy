export const LIBRARY_DEEP_DIVE_SECTIONS = [
  "LibraryBigPicture",
  "LibraryUnderTheHood",
  "ArchitectureAndDataFlow",
  "SelectionCriteria",
  "FailureModes",
  "LibraryInterviewTraps",
  "LibraryMentalModel",
] as const;

export const LIBRARY_GUIDE_SECTIONS = [
  "NonNegotiable",
  "Options",
  "InvalidatingFailure",
  "OperationalBurden",
  "LessonLinks",
] as const;

/** Wave 2 TokenX graph path under content/architecture/. Do not invent a stub. */
export const SETTLEMENT_GRAPH_RELATIVE_PATH = "graphs/tokenx-settlement.json";

/** Required scenario id when the settlement graph file exists. */
export const SETTLEMENT_INDEXER_FAILURE_SCENARIO_ID = "settlement-succeeds-indexer-fails";

export type PathKind = "read" | "write";
export type EdgeKind = "sync" | "async";
export type Ownership = "authoritative" | "derived";

export type GraphNode = {
  id: string;
  layerId: string;
  title: string;
  product: string;
  ownership: Ownership;
  optional: boolean;
  alternativeGroup: string | null;
  defaultSelected: boolean;
  paths: PathKind[];
  relatedSlugs: string[];
  href: string | null;
  summary: string;
  detail: {
    consistency: string;
    durability: string;
    failure: string;
    recovery: string;
  };
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  paths: PathKind[];
  label: string;
};

export type GraphLayer = { id: string; title: string; order: number };

export type GraphScenario = {
  id: string;
  title: string;
  summary: string;
  highlightedNodeIds: string[];
  dimmedNodeIds?: string[];
  callout: string;
};

export type ArchitectureGraph = {
  version: number;
  id: string;
  title: string;
  description: string;
  assumptions: string[];
  layers: GraphLayer[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  scenarios?: GraphScenario[];
};

export type LandscapeStatus = "available" | "later";

export type ArchitectureCatalog = {
  phase: string;
  title: string;
  description: string;
  urlPrefix: string;
  landscapes: {
    id: string;
    module: number;
    title: string;
    status: LandscapeStatus;
    href: string | null;
    description: string;
  }[];
  deepDives: { id: string; title: string; href: string; landscape: string }[];
  explorerHref: string;
  settlementExplorerHref?: string;
  guides?: { id: string; title: string; href: string }[];
  failureHref: string;
  failures?: { id: string; href: string }[];
  requiredRelatedSlugs: string[];
};

export type LibraryPageKind = "deep-dive" | "landscape" | "guide";

export type LibraryPage = {
  slug: string;
  kind: LibraryPageKind;
  title: string;
  description: string;
  landscape: string;
  relatedSlugs: string[];
  content: string;
};

export const MATRIX_COLUMN_IDS = [
  "workload",
  "consistency",
  "latency",
  "scaling",
  "failure",
  "costOps",
  "whenNot",
] as const;

export type MatrixColumnId = (typeof MATRIX_COLUMN_IDS)[number];

export type TechnologyMatrixData = {
  id: string;
  title: string;
  description: string;
  landscape?: string;
  relatedSlugs: string[];
  columns: { id: MatrixColumnId; label: string }[];
  rows: { id: string; product: string; cells: Record<MatrixColumnId, string> }[];
  assumptions: string[];
};

export type FailoverStep = {
  id: string;
  title: string;
  timeline: string;
  inFlight: string;
  consistency: string;
  durability: string;
  userVisible: string;
  recovery: string;
};

export type DatabaseFailoverWalkthrough = {
  id: string;
  title: string;
  description: string;
  relatedSlugs: string[];
  assumptions: string[];
  steps: FailoverStep[];
};

export type FailureWalkthrough = DatabaseFailoverWalkthrough;

export type TechnologySummary = {
  id: string;
  title: string;
  product: string;
  landscape: string;
  href?: string;
  workload: string;
  consistency: string;
  durability: string;
  latency: string;
  failure: string;
  whenToChoose: string;
  whenNot: string;
  relatedSlugs: string[];
};
