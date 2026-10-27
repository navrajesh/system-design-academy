import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseFailoverWalkthroughView } from "@/components/architecture/database-failover-walkthrough";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { getFailureWalkthrough } from "@/lib/architecture";

export const metadata: Metadata = {
  title: "Database primary failover",
  description: "Interactive walkthrough of PostgreSQL-class primary failure, fencing, and client-visible effects.",
};

export default function DatabaseFailoverPage() {
  const walkthrough = getFailureWalkthrough("database-failover");
  if (!walkthrough) notFound();
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/reference" className="text-sm font-medium text-slate-500 hover:text-ink">
        Back to reference hub
      </Link>
      <DatabaseFailoverWalkthroughView walkthrough={walkthrough} />
      <p className="mt-6 text-sm leading-6 text-slate-600">
        Mechanism lessons: <LessonCrossLink slug="replication-and-failover" />, <LessonCrossLink slug="failure-detection-and-recovery" />,{" "}
        <LessonCrossLink slug="idempotency-and-deduplication" />, <LessonCrossLink slug="transactions-across-boundaries" />.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/reference/technologies/postgresql" className="font-semibold text-cobalt">
          PostgreSQL deep dive
        </Link>
        {" · "}
        <Link href="/reference/architecture" className="font-semibold text-cobalt">
          Architecture explorer
        </Link>
      </p>
    </div>
  );
}
