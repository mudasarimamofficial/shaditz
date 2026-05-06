import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { CmsPageClient, type CmsPageContent } from "@/components/landing/CmsPageClient";
import { getHomepageContent } from "@/utils/homepageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

function toPageContent(v: unknown): CmsPageContent {
  const obj = v && typeof v === "object" ? (v as any) : null;
  const sections = Array.isArray(obj?.sections)
    ? obj.sections
    : Array.isArray(obj?.page?.sections)
      ? obj.page.sections
      : [];
  return { sections } as any;
}

export default async function CmsPage({ params, searchParams }: Props) {
  const [{ slug: rawSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams || Promise.resolve({}),
  ]);
  const slug = (rawSlug || "").trim();
  const isBuilderPreview = String((resolvedSearchParams as any)?.builderPreview || "") === "true";
  const globalContent = await getHomepageContent();

  const url = nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    if (!isBuilderPreview) return notFound();
    return <CmsPageClient globalContent={globalContent} initialPage={{ sections: [] }} isBuilderPreview />;
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data } = await supabase
    .from("site_pages")
    .select("slug, status, published_content")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    if (!isBuilderPreview) return notFound();
    return <CmsPageClient globalContent={globalContent} initialPage={{ sections: [] }} isBuilderPreview />;
  }

  if (String((data as any).status) !== "published" && !isBuilderPreview) {
    return notFound();
  }

  const initialPage = toPageContent((data as any).published_content);
  return <CmsPageClient globalContent={globalContent} initialPage={initialPage} isBuilderPreview={isBuilderPreview} />;
}

