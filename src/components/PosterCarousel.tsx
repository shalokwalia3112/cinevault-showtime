import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMG, mediaDate, mediaTitle, type MediaItem } from "@/lib/tmdb";

export function PosterCard({ item, onPlay }: { item: MediaItem; onPlay: (item: MediaItem) => void }) {
  const title = mediaTitle(item);
  return (
    <Button
      variant="ghost"
      onClick={() => onPlay(item)}
      className="group relative h-auto w-[150px] shrink-0 justify-start overflow-hidden rounded-md bg-card p-0 text-left whitespace-normal transition-transform duration-300 hover:scale-105 md:w-[190px]"
    >
      <img
        src={IMG(item.poster_path)}
        alt={`${title} poster`}
        loading="lazy"
        className="aspect-[2/3] w-full object-cover"
      />
      <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-background/85 px-1.5 py-0.5 text-xs font-semibold">
        <Star size={12} className="fill-primary text-primary" />
        {item.vote_average.toFixed(1)}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{mediaDate(item)?.slice(0, 4)}</p>
      </div>
    </Button>
  );
}

export function PosterCarousel({
  title,
  items,
  onPlay,
}: {
  title: string;
  items: MediaItem[] | undefined;
  onPlay: (item: MediaItem) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="group/row relative py-4">
      <h2 className="mb-3 px-6 font-display text-lg tracking-[0.2em] uppercase md:px-10">
        {title}
      </h2>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scroll-smooth px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {items
          ? items.map((item) => <PosterCard key={`${item.media_type}-${item.id}`} item={item} onPlay={onPlay} />)
          : Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-[150px] shrink-0 animate-pulse rounded-md bg-card md:w-[190px]"
              />
            ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute top-1/2 left-1 hidden -translate-y-1/2 rounded-full bg-background/75 p-2 opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
      >
        <ChevronLeft size={22} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute top-1/2 right-1 hidden -translate-y-1/2 rounded-full bg-background/75 p-2 opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
      >
        <ChevronRight size={22} />
      </Button>
    </section>
  );
}
