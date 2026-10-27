import path from "node:path";
import { validateContentDirectory } from "./content-validation.mjs";
import { validateArchitectureLibrary } from "./architecture-validation.mjs";

const contentDirectory = path.join(process.cwd(), "content", "lessons");
const architectureDirectory = path.join(process.cwd(), "content", "architecture");
const result = await validateContentDirectory(contentDirectory);
const architecture = await validateArchitectureLibrary({ architectureDirectory, lessonsDirectory: contentDirectory });

const errors = [...result.errors, ...architecture.errors];

if (errors.length) {
  console.error("Content validation failed with " + errors.length + " issue(s):");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  const diagrams = result.lessons.reduce((total, lesson) => total + lesson.charts.length, 0);
  const checks = result.lessons.reduce(
    (total, lesson) => total + [...lesson.content.matchAll(/<(?:KnowledgeCheck|ScenarioCheck)(?:\s|>)/g)].length,
    0,
  );
  console.log("Validated " + result.files.length + " lessons, " + diagrams + " Mermaid diagrams, and " + checks + " knowledge checks.");
  console.log(
    "Validated architecture library: " +
      architecture.deepDiveFiles.length +
      " deep dive(s), " +
      architecture.charts.length +
      " library diagram(s).",
  );
}
