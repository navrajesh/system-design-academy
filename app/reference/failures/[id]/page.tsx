import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseFailoverWalkthroughView } from "@/components/architecture/database-failover-walkthrough";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { getFailureWalkthrough, getFailureWalkthroughs } from "@/lib/architecture";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getFailureWalkthroughs().map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getFailureWalkthrough((await params).id);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function FailureWalkthroughPage({ params }: Props) {
  const { id } = await params;
  const walkthrough = getFailureWalkthrough(id);
  if (!walkthrough) notFound();
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/reference" className="text-sm font-medium text-slate-500 hover:text-ink">
        Back to reference hub
      </Link>
      <DatabaseFailoverWalkthroughView walkthrough={walkthrough} />
      {walkthrough.relatedSlugs.length > 0 && (
        <p className="mt-6 text-sm leading-6 text-slate-600">
          Mechanism lessons:{" "}
          {walkthrough.relatedSlugs.map((related, index) => (
            <span key={related}>
              {index > 0 ? ", " : ""}
              <LessonCrossLink slug={related} />
            </span>
          ))}
          .
        </p>
      )}
      <p className="mt-3 text-sm">
        <Link href="/reference/architecture" className="font-semibold text-cobalt">
          Architecture explorer
        </Link>
      </p>
    </div>
  );
}
