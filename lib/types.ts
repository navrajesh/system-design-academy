export type LessonMeta = {
  slug: string;
  title: string;
  description: string;
  module: number;
  moduleTitle: string;
  order: number;
  duration: number;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  tags: string[];
  objectives: string[];
};

export type Lesson = LessonMeta & {
  content: string;
  searchText: string;
};

export type ModuleSummary = {
  number: number;
  title: string;
  description: string;
  lessons: LessonMeta[];
};
