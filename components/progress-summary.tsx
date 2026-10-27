"use client";

import { useProgress } from "@/components/progress-provider";

export function ProgressSummary({ total }: { total: number }) {
  const { completed } = useProgress();
  const done = Math.min(completed.size, total);
  const percentage = total ? Math.round((done / total) * 100) : 0;
  return <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Your progress</p><p className="mt-1 text-2xl font-semibold text-white">{percentage}% complete</p></div><p className="text-sm text-blue-100">{done}/{total} lessons</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber transition-all" style={{ width: `${percentage}%` }} /></div></div>;
}
