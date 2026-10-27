import Link from "next/link";
import type { TechnologySummary } from "@/lib/architecture-types";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";

export function TechnologySummaryCard({ item }: { item: TechnologySummary }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.product}</p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">{item.title}</h3>
      <dl className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workload</dt>
          <dd>{item.workload}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consistency</dt>
          <dd>{item.consistency}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Durability</dt>
          <dd>{item.durability}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latency</dt>
          <dd>{item.latency}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failure</dt>
          <dd>{item.failure}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-moss">When to choose</dt>
          <dd>{item.whenToChoose}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-amber-700">When not</dt>
          <dd>{item.whenNot}</dd>
        </div>
      </dl>
      {item.relatedSlugs.length > 0 && (
        <p className="mt-4 text-sm text-slate-600">
          Lessons:{" "}
          {item.relatedSlugs.map((slug, index) => (
            <span key={slug}>
              {index > 0 ? ", " : ""}
              <LessonCrossLink slug={slug} />
            </span>
          ))}
        </p>
      )}
      {item.href ? (
        <Link href={item.href} className="mt-auto pt-4 text-sm font-semibold text-cobalt">
          Open deep dive
        </Link>
      ) : (
        <p className="mt-auto pt-4 text-xs font-medium uppercase tracking-wider text-slate-400">Summary only in Phase 2A</p>
      )}
    </article>
  );
}
