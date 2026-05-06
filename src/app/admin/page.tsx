import { AdminPageClient } from "@/components/admin/AdminPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function AdminPage() {
  return <AdminPageClient initialTab="builder" />;
}

