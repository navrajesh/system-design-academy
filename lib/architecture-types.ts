export const LIBRARY_DEEP_DIVE_SECTIONS = [
  "LibraryBigPicture",
  "LibraryUnderTheHood",
  "ArchitectureAndDataFlow",
  "SelectionCriteria",
  "FailureModes",
  "LibraryInterviewTraps",
  "LibraryMentalModel",
] as const;

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

export type ArchitectureGraph = {
  version: number;
  id: string;
  title: string;
  description: string;
  assumptions: string[];
  layers: GraphLayer[];
  nodes: GraphNode[];
  edges: GraphEdge[];
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
