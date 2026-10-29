"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart, title = "Architecture diagram" }: { chart: string; title?: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "Inter, ui-sans-serif, system-ui",
          themeVariables: {
            primaryColor: "#eaf0ff",
            primaryTextColor: "#161a1d",
            primaryBorderColor: "#3157d5",
            lineColor: "#64748b",
            secondaryColor: "#e4f5f1",
            tertiaryColor: "#fff4dd",
          },
        });
        const id = `mermaid-${reactId.replace(/:/g, "")}`;
        const result = await mermaid.render(id, chart.trim());
        if (alive) setSvg(result.svg);
      } catch {
        if (alive) setError(true);
      }
    };
    void render();
    return () => { alive = false; };
  }, [chart, reactId]);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <figcaption className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</figcaption>
      <div
        className="overflow-x-auto p-5 sm:p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
        tabIndex={0}
        role="region"
        aria-label={`${title}, scrolls horizontally`}
      >
        {error ? (
          <pre className="text-xs text-slate-600">{chart}</pre>
        ) : svg ? (
          <div
            className="mx-auto min-w-[620px] [&_svg]:mx-auto [&_svg]:max-w-full"
            role="img"
            aria-label={title}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="h-44 animate-pulse rounded-xl bg-slate-100" aria-label="Loading diagram" />
        )}
      </div>
    </figure>
  );
}
