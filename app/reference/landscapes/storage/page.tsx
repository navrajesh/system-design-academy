import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { TechnologyMatrix } from "@/components/architecture/technology-matrix";
import { TechnologySummaryCard } from "@/components/architecture/technology-summary-card";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { getLandscape, getMatrices, getTechnologySummaries } from "@/lib/architecture";

export const metadata: Metadata = {
  title: "Storage & Data landscape",
  description: "Module 1 technology landscape: engines, cache tiers, and where each product belongs.",
};

export default function StorageLandscapePage() {
  const landscape = getLandscape("storage");
  const matrices = getMatrices();
  const summaries = getTechnologySummaries();
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cobalt">Module 1 · Storage & Data</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">Storage & Data landscape</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {landscape?.description ??
          "Pick a store from access patterns, then name consistency, durability, failure, and operational cost. Deep dives cover PostgreSQL, Redis, and DynamoDB. Other Module 1 products are summary cards in this slice."}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Cross-links: <LessonCrossLink slug="relational-vs-nosql-selection" />, <LessonCrossLink slug="indexes-and-query-execution" />,{" "}
        <LessonCrossLink slug="caching-patterns-and-invalidation" />, <LessonCrossLink slug="replication-and-failover" />,{" "}
        <LessonCrossLink slug="transactions-across-boundaries" />.
      </p>
      <p className="mt-2 text-sm">
        <Link href="/reference/architecture" className="font-semibold text-cobalt">
          Open the layered explorer
        </Link>
      </p>

      {landscape ? (
        <div className="mt-10">
          <MDXRemote source={landscape.content} components={architectureMdxComponents} options={{ blockJS: false, blockDangerousJS: true }} />
        </div>
      ) : null}

      {summaries.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink">Other Module 1 products</h2>
          <p className="mt-2 text-sm text-slate-600">Summary cards only in Phase 2A — not seven-section deep dives.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {summaries.map((item) => (
              <TechnologySummaryCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {matrices.map((matrix) => (
        <TechnologyMatrix key={matrix.id} matrix={matrix} />
      ))}
    </div>
  );
}
