import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMG, genreNames, mediaDate, mediaTitle, type MediaItem } from "@/lib/tmdb";

const AUTOPLAY_MS = 7000;

export function TrendingHeroCarousel({
  items,
  genres,
  onPlay,
}: {
  items: MediaItem[];
  genres: { id: number; name: string }[];
  onPlay: (item: MediaItem) => void;
}) {
  const slides = items.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length, next]);

  if (slides.length === 0) return <div className="h-[85vh] w-full animate-pulse bg-card" />;

  return (
    <section
      className="relative h-[85vh] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, i) => {
        const title = mediaTitle(item);
        const isActive = i === index;
        return (
          <div
            key={`${item.media_type}-${item.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={!isActive}
          >
            <img
              src={IMG(item.backdrop_path, "original")}
              alt={`${title} backdrop`}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        );
      })}

      <div className="relative flex h-full max-w-3xl flex-col justify-end px-6 pb-20 md:px-10">
        <div className="mb-4 flex items-center gap-3">
          <Flame size={18} className="text-primary" />
          <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Trending Today
          </span>
        </div>
        {slides.map((item, i) => {
          const title = mediaTitle(item);
          const isActive = i === index;
          return (
            <div
              key={`text-${item.media_type}-${item.id}`}
              className={`${isActive ? "block" : "hidden"}`}
            >
              <h1 className="font-display text-4xl leading-tight tracking-tight uppercase md:text-6xl lg:text-7xl">
                {title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Star size={16} className="fill-primary text-primary" />
                  {item.vote_average.toFixed(1)}
                </span>
                <span className="text-muted-foreground">{mediaDate(item)?.slice(0, 4)}</span>
                <span className="rounded border border-border px-2 py-0.5 text-xs uppercase text-muted-foreground">
                  {item.media_type === "tv" ? "Series" : "Movie"}
                </span>
                {genreNames(item.genre_ids, genres).map((g) => (
                  <span key={g} className="text-muted-foreground">{g}</span>
                ))}
              </div>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/80 line-clamp-3 md:text-base">
                {item.overview}
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Button
                  onClick={() => onPlay(item)}
                  className="flex items-center gap-2 rounded bg-primary px-8 py-3 font-semibold tracking-wide text-primary-foreground uppercase transition-all hover:scale-105 hover:bg-primary/85"
                >
                  <Play size={18} className="fill-current" /> Watch Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-6 flex gap-2 md:right-10">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-primary" : "w-4 bg-foreground/30 hover:bg-foreground/50"}`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous slide"
        onClick={prev}
        className="absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-all hover:bg-background/80 md:flex"
      >
        <ChevronLeft size={24} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next slide"
        onClick={next}
        className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-all hover:bg-background/80 md:flex"
      >
        <ChevronRight size={24} />
      </Button>
    </section>
  );
}
