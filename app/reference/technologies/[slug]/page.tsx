import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { getArchitectureCatalog, getDeepDive, getDeepDives } from "@/lib/architecture";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getDeepDives().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getDeepDive((await params).slug);
  return page ? { title: page.title, description: page.description } : {};
}

export default async function TechnologyDeepDivePage({ params }: Props) {
  const { slug } = await params;
  const page = getDeepDive(slug);
  if (!page) notFound();
  const landscapeTitle =
    getArchitectureCatalog().landscapes.find((item) => item.id === page.landscape)?.title ?? page.landscape;
  return (
    <article>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href={`/reference/landscapes/${page.landscape}`} className="text-sm font-medium text-slate-500 hover:text-ink">
            Back to {landscapeTitle}
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">Library deep dive · not a curriculum lesson</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{page.description}</p>
          {page.relatedSlugs.length > 0 && (
            <p className="mt-6 text-sm leading-6 text-slate-600">
              Related lessons:{" "}
              {page.relatedSlugs.map((related, index) => (
                <span key={related}>
                  {index > 0 ? ", " : ""}
                  <LessonCrossLink slug={related} />
                </span>
              ))}
            </p>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <MDXRemote source={page.content} components={architectureMdxComponents} options={{ blockJS: false, blockDangerousJS: true }} />
      </div>
    </article>
  );
}
