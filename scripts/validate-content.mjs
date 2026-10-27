import path from "node:path";
import { validateContentDirectory } from "./content-validation.mjs";

const contentDirectory = path.join(process.cwd(), "content", "lessons");
const result = await validateContentDirectory(contentDirectory);

if (result.errors.length) {
  console.error("Content validation failed with " + result.errors.length + " issue(s):");
  for (const error of result.errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  const diagrams = result.lessons.reduce((total, lesson) => total + lesson.charts.length, 0);
  const checks = result.lessons.reduce(
    (total, lesson) => total + [...lesson.content.matchAll(/<(?:KnowledgeCheck|ScenarioCheck)(?:\s|>)/g)].length,
    0,
  );
  console.log("Validated " + result.files.length + " lessons, " + diagrams + " Mermaid diagrams, and " + checks + " knowledge checks.");
}
