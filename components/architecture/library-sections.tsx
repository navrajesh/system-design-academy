import { AlertTriangle, Brain, Compass, GitBranch, Scale, Sparkles, TriangleAlert } from "lucide-react";

type SectionProps = { title?: string; children: React.ReactNode };

function Section({
  title,
  eyebrow,
  icon: Icon,
  tone,
  children,
}: SectionProps & { eyebrow: string; icon: React.ElementType; tone: string }) {
  return (
    <section className="lesson-block scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${tone}15`, color: tone }}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
          <h2>{title ?? eyebrow}</h2>
        </div>
      </div>
      <div className="lesson-copy">{children}</div>
    </section>
  );
}

export function LibraryBigPicture(props: SectionProps) {
  return <Section {...props} eyebrow="Big picture" icon={Compass} tone="#3157d5" />;
}
export function LibraryUnderTheHood(props: SectionProps) {
  return <Section {...props} eyebrow="Under the hood" icon={Sparkles} tone="#8157c9" />;
}
export function ArchitectureAndDataFlow(props: SectionProps) {
  return <Section {...props} eyebrow="Architecture and data flow" icon={GitBranch} tone="#3157d5" />;
}
export function SelectionCriteria(props: SectionProps) {
  return <Section {...props} eyebrow="Selection criteria and alternatives" icon={Scale} tone="#df8d1b" />;
}
export function FailureModes(props: SectionProps) {
  return <Section {...props} eyebrow="Failure modes and operational tradeoffs" icon={TriangleAlert} tone="#d05f42" />;
}
export function LibraryInterviewTraps(props: SectionProps) {
  return <Section {...props} eyebrow="IC6 interview traps" icon={AlertTriangle} tone="#d05f42" />;
}
export function LibraryMentalModel(props: SectionProps) {
  return <Section {...props} eyebrow="Mental model to retain" icon={Brain} tone="#1e7160" />;
}
