import Link from "next/link";
import { ArrowRight, Clock, Layers3, Target } from "lucide-react";
import { getLessonMetas, getModules } from "@/lib/content";
import { ModuleCard } from "@/components/module-card";
import { ProgressSummary } from "@/components/progress-summary";

export default function DashboardPage() {
  const modules = getModules();
  const lessons = getLessonMetas();
  const featured = lessons[0];
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#18223a] px-6 py-8 text-white shadow-soft sm:px-9 sm:py-10 lg:px-12">
        <div className="absolute -right-24 -top-40 h-96 w-96 rounded-full bg-cobalt/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-amber/10 blur-3xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Engineering judgment, systematically built</p>
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl">Design systems that hold up in production—and in the interview.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Seven focused modules connect first principles to real architectures. Learn the mechanism, quantify the scale, and explain the trade-off clearly.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/learn/${featured.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-blue-50">Start learning <ArrowRight className="h-4 w-4" /></Link>
              <Link href="#curriculum" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore curriculum</Link>
              <Link href="/reference" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Architecture reference</Link>
            </div>
          </div>
          <ProgressSummary total={lessons.length} />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 py-6 sm:gap-5">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><Layers3 className="hidden h-5 w-5 text-cobalt sm:block" /><div><p className="text-xl font-semibold text-ink">{modules.length}</p><p className="text-xs text-slate-500">Core modules</p></div></div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><Target className="hidden h-5 w-5 text-moss sm:block" /><div><p className="text-xl font-semibold text-ink">Staff+</p><p className="text-xs text-slate-500">Interview depth</p></div></div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><Clock className="hidden h-5 w-5 text-amber sm:block" /><div><p className="text-xl font-semibold text-ink">{Math.round(totalMinutes / 60)}h</p><p className="text-xs text-slate-500">Seed curriculum</p></div></div>
      </section>

      <section id="curriculum" className="scroll-mt-24 pt-6">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cobalt">Curriculum</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Build your systems intuition</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Move in order for a guided path, or jump directly to the concept you need.</p></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{modules.map((module) => <ModuleCard key={module.number} module={module} />)}</div>
      </section>
      <footer className="mt-16 border-t border-slate-200 py-8 text-sm text-slate-400">System Design Academy · Learn the mechanism. State the trade-off.</footer>
    </div>
  );
}
