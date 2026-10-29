import type { Metadata } from "next";
import Link from "next/link";
import { ArchitectureExplorer } from "@/components/architecture/architecture-explorer";
import { getSettlementGraph } from "@/lib/architecture";

export async function generateMetadata(): Promise<Metadata> {
  const graph = getSettlementGraph();
  return { title: graph.title, description: graph.description };
}

export default function TokenXSettlementPage() {
  const graph = getSettlementGraph();
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-10">
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
        <Link href="/reference" className="hover:text-ink">
          Architecture reference
        </Link>
        <Link href="/reference/architecture" className="hover:text-ink">
          Layered explorer
        </Link>
        <Link href="/learn/design-tokenx" className="hover:text-ink">
          Design TokenX
        </Link>
      </nav>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{graph.title}</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">{graph.description}</p>
      <div className="mt-8">
        <ArchitectureExplorer graph={graph} />
      </div>
    </div>
  );
}
