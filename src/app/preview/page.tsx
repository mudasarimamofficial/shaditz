import { readFile } from "fs/promises";
import path from "path";
import { HomepageClient } from "@/components/landing/HomepageClient";
import { getHomepageContent } from "@/utils/homepageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const content = await getHomepageContent();
  let templateHtml: string | null = null;
  try {
    templateHtml = await readFile(path.join(process.cwd(), "public", "shaditz-rebuilt-1.html"), "utf8");
  } catch {
    templateHtml = null;
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const device = typeof resolvedSearchParams.device === "string" ? resolvedSearchParams.device : undefined;

  return (
    <HomepageClient
      initialContent={content}
      isBuilderPreview
      templateHtml={templateHtml || undefined}
      initialPreviewDevice={device === "mobile" || device === "tablet" || device === "desktop" ? device : undefined}
    />
  );
}
