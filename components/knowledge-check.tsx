"use client";

import { useId, useState } from "react";
import { Check, CircleHelp, X } from "lucide-react";

export function KnowledgeCheck({ question, options, correct, explanation }: { question: string; options: string[]; correct: number; explanation: string }) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === correct;
  return (
    <section className="my-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cobalt/10 text-cobalt"><CircleHelp className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cobalt">Knowledge check</p><h2 className="font-sans text-lg font-semibold text-ink">{question}</h2></div></div>
      <fieldset className="space-y-2" aria-describedby={submitted ? `${id}-feedback` : undefined}>
        <legend className="sr-only">Choose one answer</legend>
        {options.map((option, index) => {
          const chosen = selected === index;
          const revealCorrect = submitted && index === correct;
          const revealWrong = submitted && chosen && !isCorrect;
          return <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${revealCorrect ? "border-emerald-300 bg-emerald-50" : revealWrong ? "border-red-300 bg-red-50" : chosen ? "border-cobalt bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
            <input type="radio" name={id} value={index} checked={chosen} onChange={() => { setSelected(index); setSubmitted(false); }} className="mt-0.5 h-4 w-4 accent-cobalt" />
            <span className="flex-1 leading-6 text-slate-700">{option}</span>
            {revealCorrect && <Check className="h-5 w-5 text-emerald-600" />}{revealWrong && <X className="h-5 w-5 text-red-500" />}
          </label>;
        })}
      </fieldset>
      <button type="button" disabled={selected === null} onClick={() => setSubmitted(true)} className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Check answer</button>
      {submitted && <div id={`${id}-feedback`} aria-live="polite" className={`mt-5 rounded-xl p-4 text-sm leading-6 ${isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}><strong>{isCorrect ? "Exactly." : "Not quite."}</strong> {explanation}</div>}
    </section>
  );
}
