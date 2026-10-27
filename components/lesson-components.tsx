import { AlertTriangle, Brain, ChevronDown, Compass, MessageSquareQuote, Network, Scale, Sparkles } from "lucide-react";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { KnowledgeCheck } from "@/components/knowledge-check";
import { ArchitectureWalkthrough, ExecutionTimeline, FailureScenario, InteractiveCalculation, ScenarioCheck } from "@/components/learning-interactions";

type SectionProps = { title?: string; children: React.ReactNode };

function Section({ title, eyebrow, icon: Icon, tone, children }: SectionProps & { eyebrow: string; icon: React.ElementType; tone: string }) {
  return (
    <section className="lesson-block scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${tone}15`, color: tone }}><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p><h2>{title ?? eyebrow}</h2></div>
      </div>
      <div className="lesson-copy">{children}</div>
    </section>
  );
}

export function BigPicture(props: SectionProps) { return <Section {...props} eyebrow="Big picture" icon={Compass} tone="#3157d5" />; }
export function UnderTheHood(props: SectionProps) { return <Section {...props} eyebrow="Under the hood" icon={Sparkles} tone="#8157c9" />; }
export function MentalModel(props: SectionProps) { return <Section {...props} eyebrow="Mental model to retain" icon={Brain} tone="#1e7160" />; }
export function RealExamples(props: SectionProps) { return <Section {...props} eyebrow="Real examples" icon={Network} tone="#238275" />; }
export function InterviewTraps(props: SectionProps) { return <Section {...props} eyebrow="Interview insights" icon={AlertTriangle} tone="#d05f42" />; }
export function Tradeoffs(props: SectionProps) { return <Section {...props} eyebrow="Trade-offs" icon={Scale} tone="#df8d1b" />; }

export function ArchitectureDiagram({ chart, title, children }: { chart: string; title?: string; children?: React.ReactNode }) {
  return <Section eyebrow="Architecture diagram" title={title} icon={Network} tone="#3157d5">{children}<MermaidDiagram chart={chart} title={title} /></Section>;
}

export function InterviewAnswer({ children }: { children: React.ReactNode }) {
  return (
    <section className="my-10 overflow-hidden rounded-2xl bg-[#101923] text-white shadow-soft">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4"><MessageSquareQuote className="h-5 w-5 text-amber" /><h2 className="font-sans text-base font-semibold">Interview-ready answer</h2></div>
      <div className="lesson-copy interview-copy px-6 py-6 text-slate-200 sm:px-8">{children}</div>
    </section>
  );
}

export function Callout({ type = "note", title, children }: { type?: "note" | "warning" | "tip"; title: string; children: React.ReactNode }) {
  const styles = { note: "border-blue-200 bg-blue-50 text-blue-950", warning: "border-amber-200 bg-amber-50 text-amber-950", tip: "border-emerald-200 bg-emerald-50 text-emerald-950" };
  return <aside className={`my-6 rounded-xl border px-5 py-4 ${styles[type]}`}><p className="mb-1 text-xs font-bold uppercase tracking-[0.14em]">{title}</p><div className="text-sm leading-6">{children}</div></aside>;
}

export function Calculation({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="my-6 rounded-xl border border-slate-200 bg-slate-950 p-5 text-slate-100"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p><div className="font-mono text-sm leading-7 text-emerald-300">{children}</div></div>;
}

export function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return <details className="group my-4 rounded-xl border border-slate-200 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ink">{summary}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><div className="lesson-copy border-t border-slate-100 px-5 py-4">{children}</div></details>;
}

export const mdxComponents = {
  BigPicture,
  UnderTheHood,
  MentalModel,
  ArchitectureDiagram,
  RealExamples,
  InterviewTraps,
  Tradeoffs,
  KnowledgeCheck,
  InterviewAnswer,
  Callout,
  Calculation,
  Details,
  InteractiveCalculation,
  ExecutionTimeline,
  FailureScenario,
  ArchitectureWalkthrough,
  ScenarioCheck,
};
