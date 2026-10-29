import type { Metadata } from "next";
import Link from "next/link";
import {
  getArchitectureCatalog,
  getDeepDives,
  getFailureWalkthroughs,
  getGuides,
  getMatrices,
} from "@/lib/architecture";

export const metadata: Metadata = {
  title: "Architecture reference",
  description: "Technology landscapes, comparison matrices, and named failure walkthroughs for production systems.",
};

export default function ReferenceHubPage() {
  const catalog = getArchitectureCatalog();
  const deepDives = getDeepDives();
  const matrices = getMatrices();
  const failures = getFailureWalkthroughs();
  const guides = getGuides();
  const failureHrefs = new Map((catalog.failures ?? []).map((item) => [item.id, item.href]));
  const settlementHref = catalog.settlementExplorerHref ?? "/reference/architecture/tokenx";
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">Architecture reference</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{catalog.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{catalog.description}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        This library is not a curriculum lesson. Progress stays in <code>sda:completed-lessons:v1</code> and is not overwritten here.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <HubCard href={catalog.explorerHref} title="Layered explorer" body="Client to stores: sync vs async, read/write path, authoritative vs derived." />
        <HubCard href={settlementHref} title="TokenX settlement explorer" body="Ledger settlement graph with selectable scenarios. Not a curriculum lesson." />
        {catalog.landscapes
          .filter((item) => item.status === "available" && item.href)
          .map((item) => (
            <HubCard key={item.id} href={item.href!} title={item.title} body={item.description} />
          ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Failure walkthroughs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {failures.map((item) => (
            <HubCard
              key={item.id}
              href={failureHrefs.get(item.id) ?? `/reference/failures/${item.id}`}
              title={item.title}
              body={item.description}
            />
          ))}
        </div>
      </section>

      {guides.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink">Interview guides</h2>
          <ul className="mt-4 space-y-3">
            {guides.map((page) => (
              <li key={page.slug}>
                <Link href={`/reference/guides/${page.slug}`} className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2">
                  <span className="font-semibold text-ink">{page.title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{page.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Deep dives</h2>
        <ul className="mt-4 space-y-3">
          {deepDives.map((page) => (
            <li key={page.slug}>
              <Link href={`/reference/technologies/${page.slug}`} className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2">
                <span className="font-semibold text-ink">{page.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{page.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-ink">Comparison matrices</h2>
        <ul className="mt-4 list-disc pl-5 text-sm text-slate-700">
          {matrices.map((matrix) => (
            <li key={matrix.id}>
              <Link className="font-semibold text-cobalt" href={`/reference/landscapes/${matrix.landscape ?? "storage"}`}>
                {matrix.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function HubCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2">
      <h2 className="font-sans text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
