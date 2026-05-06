import { HomepageClient } from "@/components/landing/HomepageClient";
import { getHomepageContent } from "@/utils/homepageContent";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const content = await getHomepageContent();
  const isBuilderPreview = resolvedSearchParams?.builderPreview === "true";
  let templateHtml: string | null = null;
  try {
    templateHtml = await readFile(path.join(process.cwd(), "public", "shaditz-rebuilt-1.html"), "utf8");
  } catch {
    templateHtml = null;
  }
  return (
    <HomepageClient
      initialContent={content}
      isBuilderPreview={isBuilderPreview}
      templateHtml={templateHtml || undefined}
    />
  );
}
