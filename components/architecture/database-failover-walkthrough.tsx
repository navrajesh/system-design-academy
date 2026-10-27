"use client";

import { useId, useState } from "react";
import type { DatabaseFailoverWalkthrough } from "@/lib/architecture-types";

export function DatabaseFailoverWalkthroughView({ walkthrough }: { walkthrough: DatabaseFailoverWalkthrough }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const step = walkthrough.steps[active];

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby={`${id}-title`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-700">Interactive failure walkthrough</p>
      <h2 id={`${id}-title`} className="mt-1 font-display text-2xl font-semibold text-ink">
        {walkthrough.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{walkthrough.description}</p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {walkthrough.steps.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={active === index}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(index)}
              className={`flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left text-sm ${
                active === index ? "border-red-300 bg-red-50 text-red-950" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-mono text-xs font-bold">{index + 1}</span>
              <span className="font-semibold">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
      {step && (
        <div id={`${id}-panel`} className="mt-5 grid gap-3 sm:grid-cols-2" aria-live="polite">
          <Fact label="Timeline" value={step.timeline} />
          <Fact label="In-flight impact" value={step.inFlight} />
          <Fact label="Consistency" value={step.consistency} />
          <Fact label="Durability" value={step.durability} />
          <Fact label="User-visible effects" value={step.userVisible} />
          <Fact label="Recovery" value={step.recovery} />
        </div>
      )}
      <footer className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-slate-700">Assumptions — failover is not instantaneous, lossless, or always transparent</p>
        <ul className="mt-2 list-disc pl-4">
          {walkthrough.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
