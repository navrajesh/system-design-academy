"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Check, ChevronRight, Menu, Search, X } from "lucide-react";
import type { ModuleSummary } from "@/lib/types";
import { getModuleStyle } from "@/lib/module-styles";
import { ModuleIcon } from "@/components/module-icon";
import { ProgressProvider, useProgress } from "@/components/progress-provider";
import { SearchDialog, type SearchRecord } from "@/components/search-dialog";

function Sidebar({ modules, onNavigate }: { modules: ModuleSummary[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isComplete } = useProgress();
  return (
    <div className="flex h-full flex-col bg-[#111820] text-slate-200">
      <Link href="/" onClick={onNavigate} className="flex h-20 items-center gap-3 border-b border-white/10 px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cobalt text-white shadow-lg shadow-cobalt/20"><BookOpen className="h-5 w-5" /></span>
        <span><span className="block font-semibold tracking-tight text-white">System Design</span><span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Academy</span></span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-6" aria-label="Learning modules">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Reference</p>
        <Link
          href="/reference"
          onClick={onNavigate}
          className={`mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${pathname.startsWith("/reference") ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-bold">AR</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate">Architecture reference</span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Phase 2A · Storage</span>
          </span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Curriculum</p>
        <div className="space-y-1">
          {modules.map((module) => {
            const style = getModuleStyle(module.number);
            const active = module.lessons.some((lesson) => pathname === `/learn/${lesson.slug}`);
            return (
              <div key={module.number}>
                <Link href={`/learn/${module.lessons[0].slug}`} onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${style.accent}2b`, color: style.accent }}><ModuleIcon name={style.icon} className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1 truncate"><span className="mr-1.5 text-[10px] font-bold text-slate-500">{String(module.number).padStart(2, "0")}</span>{module.title}</span>
                  <ChevronRight className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-600"}`} />
                </Link>
                {active && module.lessons.length > 1 && <div className="ml-10 mt-1 space-y-1 border-l border-white/10 pl-3">{module.lessons.map((lesson) => (
                  <Link key={lesson.slug} href={`/learn/${lesson.slug}`} onClick={onNavigate} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${pathname.endsWith(lesson.slug) ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
                    {isComplete(lesson.slug) && <Check className="h-3 w-3 text-emerald-400" />}<span className="truncate">{lesson.title}</span>
                  </Link>
                ))}</div>}
              </div>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-white/10 p-5 text-xs leading-5 text-slate-500">Built for engineers who want to reason from first principles.</div>
    </div>
  );
}

function Shell({ children, modules, searchRecords }: { children: React.ReactNode; modules: ModuleSummary[]; searchRecords: SearchRecord[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block"><Sidebar modules={modules} /></aside>
      {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><aside className="absolute inset-y-0 left-0 w-[min(88vw,20rem)] shadow-2xl"><button className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button><Sidebar modules={modules} onNavigate={() => setMobileOpen(false)} /></aside></div>}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-paper/90 px-4 backdrop-blur-md sm:px-8 lg:px-10">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <Link href="/" className="text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt lg:hidden">System Design Academy</Link>
          <div className="ml-auto">
            <button onClick={openSearch} aria-label="Search lessons" className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt sm:w-72">
              <Search className="h-4 w-4" /><span className="hidden sm:inline">Search the academy</span><kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">⌘ K</kbd>
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </div>
      <SearchDialog records={searchRecords} open={searchOpen} onClose={closeSearch} />
    </div>
  );
}

export function AppShell(props: { children: React.ReactNode; modules: ModuleSummary[]; searchRecords: SearchRecord[] }) {
  return <ProgressProvider><Shell {...props} /></ProgressProvider>;
}
