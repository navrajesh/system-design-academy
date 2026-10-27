"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type SearchRecord = {
  slug: string;
  title: string;
  description: string;
  module: number;
  moduleTitle: string;
  tags: string[];
  searchText: string;
  href?: string;
};

export function SearchDialog({ records, open, onClose }: { records: SearchRecord[]; open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return records.slice(0, 7);
    return records
      .map((record) => {
        const title = record.title.toLowerCase();
        const haystack = `${title} ${record.description} ${record.moduleTitle} ${record.tags.join(" ")} ${record.searchText}`.toLowerCase();
        const matches = terms.filter((term) => haystack.includes(term)).length;
        const score = matches * 10 + terms.filter((term) => title.includes(term)).length * 8;
        return { record, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ record }) => record)
      .slice(0, 8);
  }, [query, records]);

  if (!open) return null;

  const visit = (record: SearchRecord) => {
    onClose();
    setQuery("");
    router.push(record.href ?? `/learn/${record.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/45 px-4 pt-[10vh] backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/30 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Search lessons and reference" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-5">
          <Search aria-hidden="true" className="h-5 w-5 text-slate-400" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} className="h-16 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-slate-400" placeholder="Search partitioning, consistency, Kafka…" aria-label="Search lessons and reference" />
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close search"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-2">
          {results.length ? results.map((record) => (
            <button key={`${record.href ?? "lesson"}:${record.slug}`} onClick={() => visit(record)} className="group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{record.href ? "AR" : String(record.module).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{record.title}</span>
                <span className="block truncate text-sm text-slate-500">{record.description}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-cobalt" />
            </button>
          )) : <div className="px-5 py-12 text-center text-sm text-slate-500">No lessons match “{query}”. Try a broader system design term.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500"><span>{results.length} result{results.length === 1 ? "" : "s"}</span><span><kbd>esc</kbd> to close</span></div>
      </section>
    </div>
  );
}
