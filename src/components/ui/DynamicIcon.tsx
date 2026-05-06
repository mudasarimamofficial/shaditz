import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";

type IconRef = { type: "library" | "upload"; value: string };

type Props = {
  icon?: IconRef | null;
  fallback?: IconRef | null;
  className?: string;
};

const library = {
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  telegram: Send,
} as const;

function pick(ref: IconRef | null | undefined) {
  if (!ref) return null;
  if (ref.type === "upload") return { kind: "img" as const, src: ref.value };
  const key = ref.value.toLowerCase();
  const Comp = (library as Record<string, any>)[key] || Globe;
  return { kind: "lucide" as const, Comp };
}

export function DynamicIcon({ icon, fallback, className }: Props) {
  const v = pick(icon) || pick(fallback);
  if (!v) return null;
  if (v.kind === "img") {
    return <Image src={v.src} alt="" className={className || "h-5 w-5"} width={20} height={20} unoptimized />;
  }
  const C = v.Comp;
  return <C className={className || "h-5 w-5"} />;
}
