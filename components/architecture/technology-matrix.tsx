import type { MatrixColumnId, TechnologyMatrixData } from "@/lib/architecture-types";

const DEFAULT_LABELS: Record<MatrixColumnId, string> = {
  workload: "Workload",
  consistency: "Consistency",
  latency: "Latency",
  scaling: "Scaling",
  failure: "Failure",
  costOps: "Cost / ops",
  whenNot: "When not to choose",
};

export function TechnologyMatrix({ matrix }: { matrix: TechnologyMatrixData }) {
  const columns = matrix.columns.length
    ? matrix.columns
    : (Object.keys(DEFAULT_LABELS) as MatrixColumnId[]).map((id) => ({ id, label: DEFAULT_LABELS[id] }));

  return (
    <section className="my-8" aria-labelledby={`matrix-${matrix.id}-title`}>
      <h3 id={`matrix-${matrix.id}-title`} className="font-sans text-lg font-semibold text-ink">
        {matrix.title}
      </h3>
      {matrix.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{matrix.description}</p> : null}
      <div
        className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
        tabIndex={0}
        role="region"
        aria-label={`${matrix.title}, scrolls horizontally`}
      >
        <table className="min-w-[56rem] w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            {matrix.title}. Compare products across workload, consistency, latency, scaling, failure, cost, and when not to choose.
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Product
              </th>
              {columns.map((column) => (
                <th key={column.id} scope="col" className="px-4 py-3 font-semibold text-ink">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top last:border-b-0">
                <th scope="row" className="px-4 py-3 font-semibold text-ink">
                  {row.product}
                </th>
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3 leading-6 text-slate-600">
                    {row.cells[column.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="mt-3 text-xs leading-5 text-slate-500">
        <p className="font-semibold text-slate-600">Assumptions</p>
        <ul className="mt-1 list-disc pl-4">
          {matrix.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
