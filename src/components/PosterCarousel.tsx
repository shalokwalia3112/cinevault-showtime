import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { IMG, type MediaItem } from "@/lib/tmdb";

export function PosterCard({ movie, onPlay }: { movie: MediaItem; onPlay: (m: MediaItem) => void }) {
  return (
    <button
      onClick={() => onPlay(movie)}
      className="group relative w-[150px] shrink-0 overflow-hidden rounded-md bg-card text-left transition-transform duration-300 hover:scale-105 md:w-[190px]"
    >
      <img
        src={IMG(movie.poster_path)}
        alt={`${movie.title} poster`}
        loading="lazy"
        className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:brightness-75"
      />
      <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold">
        <Star size={12} className="fill-primary text-primary" />
        {movie.vote_average.toFixed(1)}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="truncate text-sm font-medium">{movie.title}</p>
        <p className="text-xs text-muted-foreground">
          {movie.release_date?.slice(0, 4)}{movie.mediaType === "tv" ? " · Series" : ""}
        </p>
      </div>
    </button>
  );
}

export function PosterCarousel({
  title,
  movies,
  onPlay,
}: {
  title: string;
  movies: MediaItem[] | undefined;
  onPlay: (m: MediaItem) => void;
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
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 pb-3 overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] md:px-10 [&>button]:snap-start [&::-webkit-scrollbar]:hidden"
      >
        {movies
          ? movies.map((m) => <PosterCard key={m.id} movie={m} onPlay={onPlay} />)
          : Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-[150px] shrink-0 animate-pulse rounded-md bg-card md:w-[190px]"
              />
            ))}
      </div>
      <button
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute top-1/2 left-1 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 opacity-0 transition-opacity group-hover/row:opacity-100 md:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute top-1/2 right-1 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 opacity-0 transition-opacity group-hover/row:opacity-100 md:block"
      >
        <ChevronRight size={22} />
      </button>
    </section>
  );
}
