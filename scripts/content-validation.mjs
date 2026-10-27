import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const REQUIRED_SECTIONS = [
  "BigPicture",
  "UnderTheHood",
  "MentalModel",
  "ArchitectureDiagram",
  "RealExamples",
  "InterviewTraps",
  "Tradeoffs",
  "KnowledgeCheck",
  "InterviewAnswer",
];

const MODULE_TITLES = new Map([
  [1, "Storage & Data"],
  [2, "Scalability"],
  [3, "Kafka & Fault Tolerance"],
  [4, "Performance"],
  [5, "Networking"],
  [6, "CAP & Consistency"],
  [7, "Architecture & Mock Interviews"],
]);

const REQUIRED_FRONTMATTER = ["title", "description", "module", "moduleTitle", "order", "duration", "difficulty", "tags", "objectives"];
const DIFFICULTIES = new Set(["Foundation", "Intermediate", "Advanced"]);

export function extractMermaidCharts(content) {
  const charts = [];
  const pattern = /<ArchitectureDiagram\b[\s\S]*?\bchart=\{("(?:\\.|[^"\\])*")\}/g;
  for (const match of content.matchAll(pattern)) {
    try {
      charts.push(JSON.parse(match[1]));
    } catch {
      charts.push(null);
    }
  }
  return charts;
}

export function validateLessonText(raw, filename = "lesson.mdx") {
  const errors = [];
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    return { errors: [filename + ": invalid frontmatter (" + error.message + ")"], data: {}, content: "", charts: [] };
  }
  const { data, content } = parsed;

  for (const field of REQUIRED_FRONTMATTER) {
    if (data[field] === undefined || data[field] === "") errors.push(filename + ": missing frontmatter field '" + field + "'");
  }

  const moduleNumber = Number(data.module);
  if (!MODULE_TITLES.has(moduleNumber)) errors.push(filename + ": module must be an integer from 1 to 7");
  else if (data.moduleTitle !== MODULE_TITLES.get(moduleNumber)) errors.push(filename + ": moduleTitle must be '" + MODULE_TITLES.get(moduleNumber) + "'");
  if (!Number.isInteger(Number(data.order)) || Number(data.order) < 1) errors.push(filename + ": order must be a positive integer");
  if (!Number.isFinite(Number(data.duration)) || Number(data.duration) < 1) errors.push(filename + ": duration must be a positive number");
  if (!DIFFICULTIES.has(data.difficulty)) errors.push(filename + ": difficulty must be Foundation, Intermediate, or Advanced");
  if (!Array.isArray(data.tags) || data.tags.length < 3 || data.tags.length > 6) errors.push(filename + ": tags must contain 3–6 entries");
  if (!Array.isArray(data.objectives) || data.objectives.length < 2 || data.objectives.length > 4) errors.push(filename + ": objectives must contain 2–4 entries");

  let previousIndex = -1;
  for (const section of REQUIRED_SECTIONS) {
    const matches = [...content.matchAll(new RegExp("<" + section + "(?:\\s|>)", "g"))];
    if (!matches.length) {
      errors.push(filename + ": missing required section <" + section + ">");
      continue;
    }
    const index = matches[0].index ?? -1;
    if (index < previousIndex) errors.push(filename + ": <" + section + "> is out of required order");
    previousIndex = Math.max(previousIndex, index);
    if (section !== "KnowledgeCheck" && matches.length !== 1) errors.push(filename + ": expected exactly one <" + section + "> section, found " + matches.length);
  }

  const knowledgeChecks = [...content.matchAll(/<KnowledgeCheck(?:\s|>)/g)].length;
  const scenarioChecks = [...content.matchAll(/<ScenarioCheck(?:\s|>)/g)].length;
  if (knowledgeChecks < 1) errors.push(filename + ": at least one <KnowledgeCheck> is required");
  if (Number(data.duration) > 30 && knowledgeChecks + scenarioChecks < 2) errors.push(filename + ": lessons over 30 minutes require at least two checks");

  if (!content.includes("</ArchitectureDiagram>")) errors.push(filename + ": <ArchitectureDiagram> must include explanatory prose, not be self-closing");
  const charts = extractMermaidCharts(content);
  if (!charts.length) errors.push(filename + ": no Mermaid chart found in <ArchitectureDiagram>");
  if (charts.some((chart) => chart === null)) errors.push(filename + ": Mermaid chart must be a valid JSON string expression");

  return { errors, data, content, charts: charts.filter(Boolean) };
}

export async function validateContentDirectory(directory) {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
  const files = fs.readdirSync(directory).filter((file) => file.endsWith(".mdx")).sort();
  const errors = [];
  const lessons = [];

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const result = validateLessonText(fs.readFileSync(fullPath, "utf8"), file);
    errors.push(...result.errors);
    for (let index = 0; index < result.charts.length; index += 1) {
      try {
        await mermaid.parse(result.charts[index], { suppressErrors: true });
      } catch (error) {
        errors.push(file + ": Mermaid diagram " + (index + 1) + " failed to parse (" + error.message + ")");
      }
    }
    lessons.push({ file, ...result });
  }

  return { files, lessons, errors };
}
