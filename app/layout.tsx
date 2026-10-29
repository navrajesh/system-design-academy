import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import {
  getArchitectureCatalog,
  getDeepDives,
  getFailureWalkthroughs,
  getGuides,
  getLandscapes,
  getMatrices,
  getSettlementGraph,
  hasSettlementGraph,
} from "@/lib/architecture";
import { getAllLessons, getModules } from "@/lib/content";

export const metadata: Metadata = {
  title: { default: "System Design Academy", template: "%s · System Design Academy" },
  description: "A practical, interview-focused curriculum for reasoning about large-scale systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const modules = getModules();
  const lessonRecords = getAllLessons().map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    module: lesson.module,
    moduleTitle: lesson.moduleTitle,
    tags: lesson.tags,
    searchText: lesson.searchText,
  }));
  const libraryRecords = [
    ...getLandscapes().map((page) => ({
      slug: page.slug,
      href: `/reference/landscapes/${page.slug}`,
      title: page.title,
      description: page.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", page.landscape],
      searchText: page.content,
    })),
    ...getDeepDives().map((page) => ({
      slug: page.slug,
      href: `/reference/technologies/${page.slug}`,
      title: page.title,
      description: page.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", page.landscape],
      searchText: page.content,
    })),
    ...getFailureWalkthroughs().map((item) => ({
      slug: item.id,
      href: `/reference/failures/${item.id}`,
      title: item.title,
      description: item.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", "failure"],
      searchText: item.assumptions.join(" "),
    })),
    ...getMatrices().map((matrix) => ({
      slug: matrix.id,
      href: `/reference/landscapes/${matrix.landscape ?? "storage"}`,
      title: matrix.title,
      description: matrix.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", "matrix"],
      searchText: matrix.assumptions.join(" "),
    })),
    ...getGuides().map((page) => ({
      slug: page.slug,
      href: `/reference/guides/${page.slug}`,
      title: page.title,
      description: page.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", "guide"],
      searchText: page.content,
    })),
  ];
  if (hasSettlementGraph()) {
    const graph = getSettlementGraph();
    libraryRecords.push({
      slug: graph.id,
      href: getArchitectureCatalog().settlementExplorerHref ?? "/reference/architecture/tokenx",
      title: graph.title,
      description: graph.description,
      module: 0,
      moduleTitle: "Architecture reference",
      tags: ["reference", "tokenx", "settlement"],
      searchText: `${graph.title} ${graph.description}`,
    });
  }
  const searchRecords = [...lessonRecords, ...libraryRecords];
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AppShell modules={modules} searchRecords={searchRecords}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
