import type { Metadata } from "next";
import Link from "next/link";
import { ArchitectureExplorer } from "@/components/architecture/architecture-explorer";
import { getArchitectureGraph } from "@/lib/architecture";

export const metadata: Metadata = {
  title: "Layered architecture explorer",
  description: "Walk the Storage & Data request path from client to durable stores and derived views.",
};

export default function ArchitectureExplorerPage() {
  const graph = getArchitectureGraph();
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-10">
      <Link href="/reference" className="text-sm font-medium text-slate-500 hover:text-ink">
        Architecture reference
      </Link>
      <div className="mt-6">
        <ArchitectureExplorer graph={graph} />
      </div>
    </div>
  );
}
