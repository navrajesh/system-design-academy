import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Gauge, Layers3 } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAdjacentLessons, getAllLessons, getLesson } from "@/lib/content";
import { mdxComponents } from "@/components/lesson-components";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import { getModuleStyle } from "@/lib/module-styles";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson((await params).slug);
  return lesson ? { title: lesson.title, description: lesson.description } : {};
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const adjacent = getAdjacentLessons(slug);
  const style = getModuleStyle(lesson.module);
  return (
    <article>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" />Back to curriculum</Link>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: style.accent }}><span>Module {String(lesson.module).padStart(2, "0")}</span><span className="h-px w-8" style={{ backgroundColor: style.accent }} /><span>{lesson.moduleTitle}</span></div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">{lesson.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{lesson.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-6 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{lesson.duration} min</span>
            <span className="inline-flex items-center gap-2"><Gauge className="h-4 w-4" />{lesson.difficulty}</span>
            <span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4" />{lesson.tags.slice(0, 3).join(" · ")}</span>
            <span className="sm:ml-auto"><LessonCompleteButton slug={slug} /></span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {lesson.objectives.length > 0 && <aside className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-cobalt">By the end, you can</p><ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">{lesson.objectives.map((objective) => <li key={objective} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />{objective}</li>)}</ul></aside>}
        <MDXRemote
          source={lesson.content}
          components={mdxComponents}
          options={{ blockJS: false, blockDangerousJS: true }}
        />
        <div className="mt-14 flex items-stretch justify-between gap-4 border-t border-slate-200 pt-8">
          {adjacent.previous ? <Link href={`/learn/${adjacent.previous.slug}`} className="group flex max-w-[46%] flex-col rounded-xl p-3 hover:bg-white"><span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400"><ArrowLeft className="h-3 w-3" />Previous</span><span className="mt-1 text-sm font-semibold text-ink group-hover:text-cobalt">{adjacent.previous.title}</span></Link> : <span />}
          {adjacent.next ? <Link href={`/learn/${adjacent.next.slug}`} className="group flex max-w-[46%] flex-col items-end rounded-xl p-3 text-right hover:bg-white"><span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Next<ArrowRight className="h-3 w-3" /></span><span className="mt-1 text-sm font-semibold text-ink group-hover:text-cobalt">{adjacent.next.title}</span></Link> : <Link href="/" className="rounded-xl p-3 text-sm font-semibold text-cobalt hover:bg-white">Return to curriculum</Link>}
        </div>
      </div>
    </article>
  );
}
