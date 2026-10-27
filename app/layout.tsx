import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getAllLessons, getModules } from "@/lib/content";

export const metadata: Metadata = {
  title: { default: "System Design Academy", template: "%s · System Design Academy" },
  description: "A practical, interview-focused curriculum for reasoning about large-scale systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const modules = getModules();
  const searchRecords = getAllLessons().map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    module: lesson.module,
    moduleTitle: lesson.moduleTitle,
    tags: lesson.tags,
    searchText: lesson.searchText,
  }));
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
