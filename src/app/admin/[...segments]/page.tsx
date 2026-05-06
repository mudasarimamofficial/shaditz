import { AdminPageClient } from "@/components/admin/AdminPageClient";
import type { Tab } from "@/components/admin/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type Props = {
  params: Promise<{ segments?: string[] }>;
};

function tabFromSegments(segments: string[] | undefined): Tab {
  const [first, second] = segments || [];
  if (first === "pages") return "pages";
  if (first === "leads") return "leads";
  if (first === "media") return "media";
  if (first === "settings") return "settings";
  if (first === "builder") return "builder";
  if (first === "advanced" && second === "json") return "homepage";
  if (first === "advanced" && second === "code") return "custom";
  return "builder";
}

export default async function AdminSubroutePage({ params }: Props) {
  const { segments } = await params;
  return <AdminPageClient initialTab={tabFromSegments(segments)} />;
}
