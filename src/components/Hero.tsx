import { Info, Play, Star } from "lucide-react";
import { IMG, genreNames, type Movie } from "@/lib/tmdb";

export function Hero({
  movie,
  genres,
  onPlay,
}: {
  movie: Movie | undefined;
  genres: { id: number; name: string }[] | undefined;
  onPlay: (m: Movie) => void;
}) {
  if (!movie) return <div className="h-[85vh] w-full animate-pulse bg-card" />;

  return (
    <section className="relative h-[85vh] min-h-[520px] w-full">
      <img
        src={IMG(movie.backdrop_path, "original")}
        alt={`${movie.title} backdrop`}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative flex h-full max-w-2xl flex-col justify-end px-6 pb-24 md:px-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-0.5 w-8 bg-primary" />
          <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Trending this week
          </span>
        </div>
        <h1 className="font-display text-5xl leading-none tracking-tight uppercase md:text-7xl">
          {movie.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 font-semibold">
            <Star size={16} className="fill-primary text-primary" />
            {movie.vote_average.toFixed(1)}
          </span>
          <span className="text-muted-foreground">{movie.release_date?.slice(0, 4)}</span>
          {genreNames(movie.genre_ids, genres).map((g) => (
            <span key={g} className="text-muted-foreground">
              {g}
            </span>
          ))}
        </div>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/80 md:text-base">
          {movie.overview}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 rounded bg-primary px-7 py-3 font-semibold tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/85"
          >
            <Play size={18} className="fill-current" /> Play
          </button>
        </div>
      </div>
    </section>
  );
}
