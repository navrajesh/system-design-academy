import { AlertTriangle, BookOpen, ListChecks, Shield, Wrench } from "lucide-react";

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

export function NonNegotiable(props: SectionProps) {
  return <Section {...props} eyebrow="Non-negotiable" icon={Shield} tone="#3157d5" />;
}
export function Options(props: SectionProps) {
  return <Section {...props} eyebrow="Options" icon={ListChecks} tone="#8157c9" />;
}
export function InvalidatingFailure(props: SectionProps) {
  return <Section {...props} eyebrow="Invalidating failure" icon={AlertTriangle} tone="#d05f42" />;
}
export function OperationalBurden(props: SectionProps) {
  return <Section {...props} eyebrow="Operational burden" icon={Wrench} tone="#df8d1b" />;
}
export function LessonLinks(props: SectionProps) {
  return <Section {...props} eyebrow="Lesson links" icon={BookOpen} tone="#1e7160" />;
}
