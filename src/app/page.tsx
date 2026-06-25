import { HomepageClient } from "@/components/landing/HomepageClient";
import { LandingShell } from "@/components/landing/LandingShell";
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

  const preset = String((content.site as { designPreset?: string } | undefined)?.designPreset || "landing_html_v1");
  const fallback = (
    <HomepageClient
      initialContent={content}
      isBuilderPreview={isBuilderPreview}
      templateHtml={templateHtml || undefined}
    />
  );

  // Public landing (not the builder preview, not the legacy "classic" preset):
  // render the populated HTML inline (de-iframed) so content is crawlable.
  // Builder preview + classic preset keep using the iframe via HomepageClient.
  if (!isBuilderPreview && preset !== "classic" && templateHtml) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#080808]">
        <LandingShell content={content} templateHtml={templateHtml} fallback={fallback} />
      </div>
    );
  }

  return fallback;
}
