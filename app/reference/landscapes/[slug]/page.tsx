import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { TechnologyMatrix } from "@/components/architecture/technology-matrix";
import { TechnologySummaryCard } from "@/components/architecture/technology-summary-card";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { getLandscape, getLandscapes, getMatrices, getTechnologySummaries } from "@/lib/architecture";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getLandscapes().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getLandscape((await params).slug);
  return page ? { title: page.title, description: page.description } : {};
}

export default async function LandscapePage({ params }: Props) {
  const { slug } = await params;
  const landscape = getLandscape(slug);
  if (!landscape) notFound();
  const matrices = getMatrices().filter((matrix) => (matrix.landscape ?? "storage") === slug);
  const summaries = getTechnologySummaries().filter((item) => item.landscape === slug);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/reference" className="text-sm font-medium text-slate-500 hover:text-ink">
        Back to reference hub
      </Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">Technology landscape · not a curriculum lesson</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{landscape.title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{landscape.description}</p>
      {landscape.relatedSlugs.length > 0 && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Cross-links:{" "}
          {landscape.relatedSlugs.map((related, index) => (
            <span key={related}>
              {index > 0 ? ", " : ""}
              <LessonCrossLink slug={related} />
            </span>
          ))}
          .
        </p>
      )}
      <p className="mt-2 text-sm">
        <Link href="/reference/architecture" className="font-semibold text-cobalt">
          Open the layered explorer
        </Link>
      </p>

      <div className="mt-10">
        <MDXRemote source={landscape.content} components={architectureMdxComponents} options={{ blockJS: false, blockDangerousJS: true }} />
      </div>

      {summaries.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink">Products at a glance</h2>
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
