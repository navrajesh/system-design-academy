import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type {
  ArchitectureCatalog,
  ArchitectureGraph,
  DatabaseFailoverWalkthrough,
  LibraryPage,
  LibraryPageKind,
  TechnologyMatrixData,
  TechnologySummary,
} from "@/lib/architecture-types";

export type {
  ArchitectureCatalog,
  ArchitectureGraph,
  DatabaseFailoverWalkthrough,
  FailureWalkthrough,
  FailoverStep,
  GraphEdge,
  GraphLayer,
  GraphNode,
  LibraryPage,
  LibraryPageKind,
  MatrixColumnId,
  PathKind,
  TechnologyMatrixData,
  TechnologySummary,
} from "@/lib/architecture-types";
export { LIBRARY_DEEP_DIVE_SECTIONS, MATRIX_COLUMN_IDS } from "@/lib/architecture-types";

const ARCH_DIR = path.join(process.cwd(), "content", "architecture");
const TECHNOLOGIES_DIR = path.join(ARCH_DIR, "technologies");
const LANDSCAPES_DIR = path.join(ARCH_DIR, "landscapes");
const MATRICES_DIR = path.join(ARCH_DIR, "matrices");
const FAILURES_DIR = path.join(ARCH_DIR, "failures");
const SUMMARIES_FILE = path.join(ARCH_DIR, "summaries.json");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export const getArchitectureGraph = cache((): ArchitectureGraph => {
  return readJson<ArchitectureGraph>(path.join(ARCH_DIR, "graph.json"));
});

export const getArchitectureCatalog = cache((): ArchitectureCatalog => {
  return readJson<ArchitectureCatalog>(path.join(ARCH_DIR, "catalog.json"));
});

function parseLibraryPage(directory: string, filename: string): LibraryPage {
  const raw = fs.readFileSync(path.join(directory, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.mdx$/, "");
  const kind = data.kind as LibraryPageKind;
  if (!kind) throw new Error(`${filename}: missing frontmatter field 'kind'`);
  return {
    slug: String(data.id ?? slug),
    kind,
    title: String(data.title),
    description: String(data.description),
    landscape: String(data.landscape ?? "storage"),
    relatedSlugs: Array.isArray(data.relatedSlugs) ? data.relatedSlugs.map(String) : [],
    content,
  };
}

function listMdx(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => file.endsWith(".mdx"));
}

export const getDeepDives = cache((): LibraryPage[] => {
  return listMdx(TECHNOLOGIES_DIR)
    .map((file) => parseLibraryPage(TECHNOLOGIES_DIR, file))
    .sort((a, b) => a.title.localeCompare(b.title));
});

export const getDeepDive = cache((slug: string) => getDeepDives().find((page) => page.slug === slug));

export const getLandscapes = cache((): LibraryPage[] => {
  return listMdx(LANDSCAPES_DIR).map((file) => parseLibraryPage(LANDSCAPES_DIR, file));
});

export const getLandscape = cache((slug: string) => getLandscapes().find((page) => page.slug === slug));

export const getMatrices = cache((): TechnologyMatrixData[] => {
  if (!fs.existsSync(MATRICES_DIR)) return [];
  return fs
    .readdirSync(MATRICES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson<TechnologyMatrixData>(path.join(MATRICES_DIR, file)));
});

export const getMatrix = cache((id: string) => getMatrices().find((matrix) => matrix.id === id));

export const getFailureWalkthroughs = cache((): DatabaseFailoverWalkthrough[] => {
  if (!fs.existsSync(FAILURES_DIR)) return [];
  return fs
    .readdirSync(FAILURES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson<DatabaseFailoverWalkthrough>(path.join(FAILURES_DIR, file)));
});

export const getFailureWalkthrough = cache((id: string) => getFailureWalkthroughs().find((item) => item.id === id));

export const getTechnologySummaries = cache((): TechnologySummary[] => {
  if (!fs.existsSync(SUMMARIES_FILE)) return [];
  return readJson<TechnologySummary[]>(SUMMARIES_FILE);
});
