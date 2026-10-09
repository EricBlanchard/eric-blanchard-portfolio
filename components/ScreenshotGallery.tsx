import Image from "next/image";
import type { Screenshot } from "@/content/types";

export function ScreenshotGallery({ shots }: { shots: readonly Screenshot[] }) {
  if (shots.length === 0) return null;
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {shots.map((shot) => (
        <figure key={shot.src} className="flex flex-col gap-2">
          <Image
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="h-auto w-full rounded-md border border-line"
          />
          {shot.caption && <figcaption className="text-sm text-muted">{shot.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
