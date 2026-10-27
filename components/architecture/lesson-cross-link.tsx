import Link from "next/link";
import { getLesson } from "@/lib/content";

export function LessonCrossLink({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const lesson = getLesson(slug);
  if (!lesson) {
    throw new Error(`LessonCrossLink: unknown lesson slug "${slug}". Validation must fail closed on unpublished or unknown slugs.`);
  }
  return (
    <Link
      href={`/learn/${slug}`}
      className="font-semibold text-cobalt underline decoration-cobalt/30 underline-offset-2 hover:decoration-cobalt"
    >
      {children ?? lesson.title}
    </Link>
  );
}
