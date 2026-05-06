import type { ReactNode } from "react";

type Settings = {
  backgroundType?: "color" | "image" | "video";
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  containerWidth?: "sm" | "md" | "lg" | "full";
  alignment?: "left" | "center" | "right";
};

type Props = {
  settings?: Record<string, unknown> | null;
  children: ReactNode;
};

function normalize(settings?: Record<string, unknown> | null): Settings {
  if (!settings) return {};
  const s = settings as any;
  const legacyBgColor = typeof s.backgroundColorHex === "string" ? s.backgroundColorHex : undefined;
  const legacyBgUrl = typeof s.background?.url === "string" ? s.background.url : undefined;
  const legacyPaddingY = typeof s.paddingY === "number" ? s.paddingY : undefined;

  const backgroundType: Settings["backgroundType"] =
    s.backgroundType || (legacyBgUrl ? "image" : legacyBgColor ? "color" : undefined);

  return {
    backgroundType,
    backgroundColor:
      typeof s.backgroundColor === "string" ? s.backgroundColor : legacyBgColor,
    backgroundImage:
      typeof s.backgroundImage === "string" ? s.backgroundImage : legacyBgUrl,
    backgroundVideo: typeof s.backgroundVideo === "string" ? s.backgroundVideo : undefined,
    overlayColor: typeof s.overlayColor === "string" ? s.overlayColor : undefined,
    paddingTop:
      typeof s.paddingTop === "number" ? s.paddingTop : legacyPaddingY,
    paddingBottom:
      typeof s.paddingBottom === "number" ? s.paddingBottom : legacyPaddingY,
    containerWidth: s.containerWidth,
    alignment: s.alignment,
  };
}

export function SectionWrapper({ settings, children }: Props) {
  const s = normalize(settings);
  const bgType = s.backgroundType;
  const bgColor = bgType === "color" ? s.backgroundColor : undefined;
  const bgImage = bgType === "image" ? s.backgroundImage : undefined;
  const overlay = s.overlayColor;

  const style: Record<string, any> = {
    backgroundColor: bgColor || undefined,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: bgImage ? "cover" : undefined,
    backgroundPosition: bgImage ? "center" : undefined,
    backgroundRepeat: bgImage ? "no-repeat" : undefined,
    paddingTop: typeof s.paddingTop === "number" ? s.paddingTop : undefined,
    paddingBottom: typeof s.paddingBottom === "number" ? s.paddingBottom : undefined,
  };

  const align = s.alignment === "left" ? "items-start" : s.alignment === "right" ? "items-end" : "items-center";
  const width =
    s.containerWidth === "sm"
      ? "max-w-3xl"
      : s.containerWidth === "md"
        ? "max-w-5xl"
        : s.containerWidth === "lg"
          ? "max-w-7xl"
          : "max-w-none";

  return (
    <div className="relative w-full" style={style}>
      {overlay ? <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: overlay }} /> : null}
      {bgType === "video" && s.backgroundVideo ? (
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={s.backgroundVideo}
        />
      ) : null}
      <div className={`relative flex w-full flex-col ${align}`}>
        <div className={`w-full ${width}`}>{children}</div>
      </div>
    </div>
  );
}

