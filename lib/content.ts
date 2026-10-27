import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type { Lesson, LessonMeta, ModuleSummary } from "@/lib/types";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

const moduleDescriptions: Record<number, string> = {
  1: "Choose storage models, distribute data, and design durable data paths.",
  2: "Scale services predictably with load balancing, caching, and elasticity.",
  3: "Build event-driven systems that survive retries, partitions, and failures.",
  4: "Reason about latency, throughput, queues, and performance budgets.",
  5: "Understand the network behavior behind reliable distributed services.",
  6: "Make explicit consistency choices under concurrency and partition.",
  7: "Turn requirements into clear architectures and strong interview narratives.",
};

function compactForSearch(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}#*_`>|[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLesson(filename: string): Lesson {
  const raw = fs.readFileSync(path.join(LESSONS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const required = ["title", "description", "module", "moduleTitle", "order", "duration", "difficulty"];
  for (const field of required) {
    if (data[field] === undefined) throw new Error(`${filename}: missing frontmatter field '${field}'`);
  }

  const slug = filename.replace(/\.mdx$/, "");
  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    module: Number(data.module),
    moduleTitle: String(data.moduleTitle),
    order: Number(data.order),
    duration: Number(data.duration),
    difficulty: data.difficulty as Lesson["difficulty"],
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    objectives: Array.isArray(data.objectives) ? data.objectives.map(String) : [],
    content,
    searchText: compactForSearch(content),
  };
}

export const getAllLessons = cache((): Lesson[] => {
  if (!fs.existsSync(LESSONS_DIR)) return [];
  return fs
    .readdirSync(LESSONS_DIR)
    .filter((filename) => filename.endsWith(".mdx"))
    .map(parseLesson)
    .sort((a, b) => a.module - b.module || a.order - b.order);
});

export const getLesson = cache((slug: string) => getAllLessons().find((lesson) => lesson.slug === slug));

export const getLessonMetas = cache((): LessonMeta[] =>
  getAllLessons().map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    module: lesson.module,
    moduleTitle: lesson.moduleTitle,
    order: lesson.order,
    duration: lesson.duration,
    difficulty: lesson.difficulty,
    tags: lesson.tags,
    objectives: lesson.objectives,
  })),
);

export const getModules = cache((): ModuleSummary[] => {
  const grouped = new Map<number, LessonMeta[]>();
  for (const lesson of getLessonMetas()) {
    grouped.set(lesson.module, [...(grouped.get(lesson.module) ?? []), lesson]);
  }
  return [...grouped.entries()].map(([number, lessons]) => ({
    number,
    title: lessons[0].moduleTitle,
    description: moduleDescriptions[number],
    lessons,
  }));
});

export function getAdjacentLessons(slug: string) {
  const lessons = getLessonMetas();
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}
