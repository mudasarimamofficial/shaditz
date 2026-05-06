const replacements: Array<[string, string]> = [
  ["Î“Ã‡Ã¶", "-"],
  ["Î“Ã‡Ã´", "-"],
  ["â€”", "-"],
  ["â€“", "-"],
  ["â€¦", "..."],
  ["â€œ", '"'],
  ["â€", '"'],
  ["â€˜", "'"],
  ["â€™", "'"],
  ["Â©", "(c)"],
  ["â†’", "->"],
  ["â†“", "v"],
  ["$$", "$"],
];

function sanitizeString(s: string) {
  let out = s;
  for (const [from, to] of replacements) out = out.split(from).join(to);
  return out;
}

export function sanitizeContentStrings<T>(value: T): T {
  if (typeof value === "string") return sanitizeString(value) as T;
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeContentStrings(v)) as T;
  if (typeof value !== "object") return value;
  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(src)) out[k] = sanitizeContentStrings(src[k]);
  return out as T;
}
