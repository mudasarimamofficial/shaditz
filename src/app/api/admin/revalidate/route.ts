import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  paths: z.array(z.string().min(1).max(220)).min(1).max(20),
});

function safePath(value: string) {
  const path = value.trim();
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return adminJsonError(gate);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const paths = Array.from(new Set(parsed.data.paths.map(safePath).filter(Boolean))) as string[];
  if (!paths.length) {
    return NextResponse.json({ ok: false, message: "No valid paths" }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, paths }, { status: 200 });
}
