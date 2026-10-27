"use client";

import { Check, Circle } from "lucide-react";
import { useProgress } from "@/components/progress-provider";

export function LessonCompleteButton({ slug }: { slug: string }) {
  const { isComplete, toggle } = useProgress();
  const complete = isComplete(slug);
  return <button onClick={() => toggle(slug)} aria-pressed={complete} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${complete ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-cobalt text-white hover:bg-blue-700"}`}>{complete ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}{complete ? "Completed" : "Mark complete"}</button>;
}
