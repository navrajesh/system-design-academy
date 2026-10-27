"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { ModuleSummary } from "@/lib/types";
import { getModuleStyle } from "@/lib/module-styles";
import { ModuleIcon } from "@/components/module-icon";
import { useProgress } from "@/components/progress-provider";

export function ModuleCard({ module }: { module: ModuleSummary }) {
  const style = getModuleStyle(module.number);
  const { isComplete } = useProgress();
  const completed = module.lessons.filter((lesson) => isComplete(lesson.slug)).length;
  const percentage = Math.round((completed / module.lessons.length) * 100);
  return (
    <Link href={`/learn/${module.lessons[0].slug}`} className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-2xl" style={{ backgroundColor: style.pale }} />
      <div className="relative flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: style.pale, color: style.accent }}><ModuleIcon name={style.icon} className="h-6 w-6" /></span>
        <span className="font-mono text-xs font-semibold tracking-[0.14em] text-slate-300">MODULE {String(module.number).padStart(2, "0")}</span>
      </div>
      <h2 className="relative mt-6 font-display text-2xl font-semibold tracking-tight text-ink">{module.title}</h2>
      <p className="relative mt-2 flex-1 text-sm leading-6 text-slate-500">{module.description}</p>
      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span>{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}</span><span>{completed ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" />{completed} done</span> : "Start module"}</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: style.accent }} /></div>
      </div>
      <ArrowUpRight className="absolute bottom-6 right-6 h-5 w-5 translate-y-1 text-slate-300 opacity-0 transition group-hover:translate-y-0 group-hover:text-ink group-hover:opacity-100" />
    </Link>
  );
}
