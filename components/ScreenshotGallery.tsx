import Image from "next/image";
import type { Screenshot } from "@/content/types";

function Shot({ shot, sizes }: { shot: Screenshot; sizes: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes={sizes}
        className="h-auto w-full rounded-md border border-line"
      />
      {shot.caption && <figcaption className="text-sm text-muted">{shot.caption}</figcaption>}
    </figure>
  );
}

/** Desktop screenshots get the full width; phone screenshots sit side by side. */
export function ScreenshotGallery({ shots }: { shots: readonly Screenshot[] }) {
  if (shots.length === 0) return null;
  const phones = shots.filter((s) => s.device === "phone");
  const desktops = shots.filter((s) => s.device !== "phone");
  return (
    <div className="flex flex-col gap-12">
      {desktops.length > 0 && (
        <div className="flex flex-col gap-12">
          {desktops.map((shot) => (
            <Shot key={shot.src} shot={shot} sizes="(min-width: 1248px) 1184px, 100vw" />
          ))}
        </div>
      )}
      {phones.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {phones.map((shot) => (
            <Shot
              key={shot.src}
              shot={shot}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
