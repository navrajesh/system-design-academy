"use client";

import { useId, useMemo, useState } from "react";
import { AlertTriangle, Calculator, Check, ChevronRight, CircleHelp, Network, RotateCcw, X } from "lucide-react";

type CalculatorMode = "little-law" | "cache-load" | "event-ingress";

function RangeField({ id, label, value, min, max, step, suffix, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white p-4">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"><span>{label}</span><output htmlFor={id} className="font-mono text-cobalt">{value.toLocaleString()}{suffix}</output></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-cobalt" />
      <span className="mt-1 flex justify-between text-[10px] text-slate-400"><span>{min.toLocaleString()}{suffix}</span><span>{max.toLocaleString()}{suffix}</span></span>
    </label>
  );
}

export function InteractiveCalculation({ mode, title, initialRate, initialPeakFactor, initialEventBytes, initialReplication }: { mode: CalculatorMode; title?: string; initialRate?: number; initialPeakFactor?: number; initialEventBytes?: number; initialReplication?: number }) {
  const baseId = useId();
  const [arrivalRate, setArrivalRate] = useState(initialRate ?? (mode === "event-ingress" ? 100_000_000 : mode === "cache-load" ? 50_000 : 2_000));
  const [latency, setLatency] = useState(200);
  const [fraction, setFraction] = useState(mode === "cache-load" ? 90 : 65);
  const [serviceTime, setServiceTime] = useState(20);
  const [poolSize, setPoolSize] = useState(50);
  const [peakFactor, setPeakFactor] = useState(initialPeakFactor ?? 10);
  const [eventBytes, setEventBytes] = useState(initialEventBytes ?? 800);
  const [replication, setReplication] = useState(initialReplication ?? 3);

  const result = useMemo(() => {
    if (mode === "little-law") {
      const inFlight = arrivalRate * (latency / 1_000);
      const dbRate = arrivalRate * (fraction / 100);
      const dbConcurrency = dbRate * (serviceTime / 1_000);
      const utilization = (dbConcurrency / poolSize) * 100;
      return {
        headline: `${Math.round(dbConcurrency).toLocaleString()} DB connections busy on average`,
        detail: `${Math.round(inFlight).toLocaleString()} total requests in flight; ${Math.round(dbRate).toLocaleString()} DB-using requests/s; pool utilization ≈ ${Math.round(utilization)}%.`,
        warning: utilization >= 80 ? "This pool has little queueing headroom. Reduce DB demand, service time, or raise capacity." : "The pool has modeled headroom, but validate p95 service time and connection limits.",
      };
    }
    if (mode === "cache-load") {
      const originRate = arrivalRate * (1 - fraction / 100);
      return {
        headline: `${Math.round(originRate).toLocaleString()} origin reads/s`,
        detail: `${fraction}% of ${arrivalRate.toLocaleString()} reads/s are served by cache; a cold-cache event exposes the origin to the full ${arrivalRate.toLocaleString()} reads/s.`,
        warning: fraction >= 95 ? "A high hit rate is powerful, but also makes cold-start and stampede protection more important." : "Increase hit rate only for data whose staleness contract allows it.",
      };
    }
    const average = arrivalRate / 86_400;
    const peak = average * peakFactor;
    const mbPerSecond = (peak * eventBytes) / 1_000_000;
    return {
      headline: `${Math.round(peak).toLocaleString()} peak events/s`,
      detail: `${average.toFixed(0)} average events/s; ${mbPerSecond.toFixed(1)} MB/s leader ingress; ${(mbPerSecond * replication).toFixed(1)} MB/s replicated broker writes.`,
      warning: "This is a planning envelope, not a broker count. Add protocol overhead, compression, retention, and measured per-broker limits.",
    };
  }, [arrivalRate, eventBytes, fraction, latency, mode, peakFactor, poolSize, replication, serviceTime]);

  return (
    <section className="my-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6" aria-labelledby={`${baseId}-title`}>
      <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cobalt text-white"><Calculator className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cobalt">Interactive calculation</p><h3 id={`${baseId}-title`} className="font-sans text-base font-semibold text-ink">{title ?? "Explore the capacity envelope"}</h3></div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "little-law" && <>
          <RangeField id={`${baseId}-rate`} label="Total arrival rate" value={arrivalRate} min={100} max={10_000} step={100} suffix=" req/s" onChange={setArrivalRate} />
          <RangeField id={`${baseId}-latency`} label="End-to-end latency" value={latency} min={20} max={1_000} step={10} suffix=" ms" onChange={setLatency} />
          <RangeField id={`${baseId}-fraction`} label="Requests using DB" value={fraction} min={5} max={100} step={5} suffix="%" onChange={setFraction} />
          <RangeField id={`${baseId}-service`} label="DB connection hold time" value={serviceTime} min={2} max={200} step={2} suffix=" ms" onChange={setServiceTime} />
          <RangeField id={`${baseId}-pool`} label="Pool size" value={poolSize} min={10} max={500} step={10} suffix="" onChange={setPoolSize} />
        </>}
        {mode === "cache-load" && <>
          <RangeField id={`${baseId}-rate`} label="Read traffic" value={arrivalRate} min={1_000} max={200_000} step={1_000} suffix=" req/s" onChange={setArrivalRate} />
          <RangeField id={`${baseId}-hit`} label="Cache hit rate" value={fraction} min={0} max={99} step={1} suffix="%" onChange={setFraction} />
        </>}
        {mode === "event-ingress" && <>
          <RangeField id={`${baseId}-events`} label="Events per day" value={arrivalRate} min={10_000_000} max={500_000_000} step={10_000_000} suffix="" onChange={setArrivalRate} />
          <RangeField id={`${baseId}-peak`} label="Peak multiplier" value={peakFactor} min={1} max={25} step={1} suffix="×" onChange={setPeakFactor} />
          <RangeField id={`${baseId}-bytes`} label="Bytes per event" value={eventBytes} min={100} max={5_000} step={100} suffix=" B" onChange={setEventBytes} />
          <RangeField id={`${baseId}-rf`} label="Replication factor" value={replication} min={1} max={5} step={1} suffix="×" onChange={setReplication} />
        </>}
      </div>
      <div className="mt-4 rounded-xl bg-slate-950 p-4 text-slate-100" aria-live="polite"><p className="font-mono text-sm font-semibold text-emerald-300">{result.headline}</p><p className="mt-2 text-sm leading-6 text-slate-300">{result.detail}</p><p className="mt-2 text-xs leading-5 text-amber-200">{result.warning}</p></div>
    </section>
  );
}

export type TimelineStep = { title: string; detail: string; state?: string; failure?: string };

export function ExecutionTimeline({ title, steps }: { title: string; steps: TimelineStep[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <section className="my-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby={`${id}-title`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">Step-by-step execution</p><h3 id={`${id}-title`} className="mt-1 font-sans text-base font-semibold text-ink">{title}</h3>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{steps.map((item, index) => <li key={`${item.title}-${index}`}><button type="button" aria-pressed={active === index} aria-controls={`${id}-panel`} onClick={() => setActive(index)} className={`flex h-full w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${active === index ? "border-violet-300 bg-violet-50 text-violet-950" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-mono text-xs font-bold">{index + 1}</span><span className="font-semibold">{item.title}</span></button></li>)}</ol>
      <div id={`${id}-panel`} className="mt-4 rounded-xl bg-slate-50 p-4" aria-live="polite"><p className="text-sm leading-6 text-slate-700">{step.detail}</p>{step.state && <p className="mt-2 text-xs font-semibold text-cobalt">State: {step.state}</p>}{step.failure && <p className="mt-2 flex gap-2 text-xs leading-5 text-red-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Crash here: {step.failure}</p>}</div>
    </section>
  );
}

type FailureChoice = { label: string; impact: string; recovery: string };

export function FailureScenario({ title, prompt, choices }: { title: string; prompt: string; choices: FailureChoice[] }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const choice = choices[selected];
  return (
    <section className="my-7 rounded-2xl border border-red-100 bg-red-50/60 p-5 sm:p-6" aria-labelledby={`${id}-title`}>
      <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Failure explorer</p><h3 id={`${id}-title`} className="font-sans text-base font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{prompt}</p></div></div>
      <div className="mt-4 flex flex-wrap gap-2">{choices.map((item, index) => <button type="button" key={item.label} onClick={() => setSelected(index)} aria-pressed={selected === index} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${selected === index ? "border-red-300 bg-white text-red-800" : "border-transparent bg-red-100/70 text-red-700 hover:bg-red-100"}`}>{item.label}</button>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite"><div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impact</p><p className="mt-1 text-sm leading-6 text-slate-700">{choice.impact}</p></div><div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Recovery</p><p className="mt-1 text-sm leading-6 text-slate-700">{choice.recovery}</p></div></div>
    </section>
  );
}

type ArchitectureStage = { name: string; owner: string; state: string; boundary: string; failure: string; recovery: string };

export function ArchitectureWalkthrough({ title, stages }: { title: string; stages: ArchitectureStage[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const stage = stages[active];
  return (
    <section className="my-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby={`${id}-title`}>
      <div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex items-center gap-2 text-cobalt"><Network className="h-4 w-4" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Architecture walkthrough</p></div><h3 id={`${id}-title`} className="mt-1 font-sans text-base font-semibold text-ink">{title}</h3></div>
      <div className="overflow-x-auto p-4"><ol className="flex min-w-max items-center">{stages.map((item, index) => <li className="flex items-center" key={`${item.name}-${index}`}><button type="button" onClick={() => setActive(index)} aria-pressed={active === index} className={`min-w-36 rounded-xl border px-4 py-3 text-left ${active === index ? "border-cobalt bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage {index + 1}</span><span className="mt-1 block text-sm font-semibold text-ink">{item.name}</span></button>{index < stages.length - 1 && <ChevronRight className="mx-1 h-4 w-4 text-slate-300" />}</li>)}</ol></div>
      <div className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite"><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Owner & state</p><p className="mt-1 text-sm text-slate-700"><strong>{stage.owner}</strong><br />{stage.state}</p></div><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-cobalt">Boundary</p><p className="mt-1 text-sm text-slate-700">{stage.boundary}</p></div><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-red-600">Failure</p><p className="mt-1 text-sm text-slate-700">{stage.failure}</p></div><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-emerald-600">Recovery</p><p className="mt-1 text-sm text-slate-700">{stage.recovery}</p></div></div>
    </section>
  );
}

type ScenarioOption = { label: string; feedback: string };

export function ScenarioCheck({ scenario, question, options, correct, explanation }: { scenario: string; question: string; options: ScenarioOption[]; correct: number; explanation: string }) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === correct;
  const reset = () => { setSelected(null); setSubmitted(false); };
  return (
    <section className="my-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby={`${id}-question`}>
      <div className="mb-4 flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber"><CircleHelp className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Scenario check</p><p className="mt-1 text-sm leading-6 text-slate-500">{scenario}</p><h2 id={`${id}-question`} className="mt-2 font-sans text-lg font-semibold text-ink">{question}</h2></div></div>
      <fieldset className="space-y-2"><legend className="sr-only">Select the most defensible response</legend>{options.map((option, index) => { const chosen = selected === index; const right = submitted && index === correct; const wrong = submitted && chosen && !isCorrect; return <label key={option.label} className={`block cursor-pointer rounded-xl border p-4 ${right ? "border-emerald-300 bg-emerald-50" : wrong ? "border-red-300 bg-red-50" : chosen ? "border-cobalt bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}><span className="flex items-start gap-3"><input type="radio" name={id} checked={chosen} onChange={() => { setSelected(index); setSubmitted(false); }} className="mt-1 accent-cobalt" /><span className="flex-1 text-sm font-semibold leading-6 text-slate-700">{option.label}</span>{right && <Check className="h-5 w-5 text-emerald-600" />}{wrong && <X className="h-5 w-5 text-red-500" />}</span>{submitted && chosen && <span className="mt-2 block pl-7 text-sm leading-6 text-slate-600">{option.feedback}</span>}</label>; })}</fieldset>
      <div className="mt-5 flex gap-3"><button type="button" disabled={selected === null} onClick={() => setSubmitted(true)} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Defend this choice</button>{submitted && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"><RotateCcw className="h-4 w-4" />Retry</button>}</div>
      {submitted && <div className={`mt-5 rounded-xl p-4 text-sm leading-6 ${isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`} aria-live="polite"><strong>{isCorrect ? "Defensible." : "Reconsider the failure boundary."}</strong> {explanation}</div>}
    </section>
  );
}
