import type { Metadata } from "next";
import Link from "next/link";
import {
  getArchitectureCatalog,
  getDeepDives,
  getFailureWalkthroughs,
  getMatrices,
} from "@/lib/architecture";

export const metadata: Metadata = {
  title: "Architecture reference",
  description: "Technology landscape for production systems, starting with Storage & Data.",
};

export default function ReferenceHubPage() {
  const catalog = getArchitectureCatalog();
  const deepDives = getDeepDives();
  const matrices = getMatrices();
  const failures = getFailureWalkthroughs();
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">Phase 2A</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{catalog.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{catalog.description}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        This library is not a curriculum lesson. Progress stays in <code>sda:completed-lessons:v1</code> and is not overwritten here.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <HubCard href={catalog.explorerHref} title="Layered explorer" body="Client to stores: sync vs async, read/write path, authoritative vs derived." />
        {catalog.landscapes
          .filter((item) => item.status === "available" && item.href)
          .map((item) => (
            <HubCard key={item.id} href={item.href!} title={item.title} body={item.description} />
          ))}
        {failures.map((item) => (
          <HubCard key={item.id} href={catalog.failureHref} title={item.title} body={item.description} />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Deep dives</h2>
        <ul className="mt-4 space-y-3">
          {deepDives.map((page) => (
            <li key={page.slug}>
              <Link href={`/reference/technologies/${page.slug}`} className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cobalt">
                <span className="font-semibold text-ink">{page.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{page.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Comparison matrices</h2>
        <p className="mt-2 text-sm text-slate-600">Rendered on the Storage & Data landscape with assumption footnotes.</p>
        <ul className="mt-4 list-disc pl-5 text-sm text-slate-700">
          {matrices.map((matrix) => (
            <li key={matrix.id}>
              <Link className="font-semibold text-cobalt" href="/reference/landscapes/storage">
                {matrix.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Later landscapes</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {catalog.landscapes
            .filter((item) => item.status === "later")
            .map((item) => (
              <li key={item.id}>
                <span className="font-semibold text-ink">Module {item.module}: {item.title}</span> — {item.description}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function HubCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cobalt">
      <h2 className="font-sans text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
