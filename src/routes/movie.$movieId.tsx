import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { embedUrl, fetchMovieDetails, IMG } from "@/lib/tmdb";

const movieQueryOptions = (movieId: string) =>
  queryOptions({
    queryKey: ["movie", movieId],
    queryFn: () => {
      const id = Number(movieId);
      if (!Number.isInteger(id) || id <= 0) throw new Error("This movie could not be found.");
      return fetchMovieDetails(id);
    },
  });

export const Route = createFileRoute("/movie/$movieId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(movieQueryOptions(params.movieId)),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Watch on CineVault` : "Movie — CineVault";
    const description = loaderData?.overview || "Watch this movie and explore its details on CineVault.";
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "video.movie" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  pendingComponent: MoviePageSkeleton,
  errorComponent: MoviePageError,
  component: MoviePage,
});

function MoviePage() {
  const { movieId } = Route.useParams();
  const { data: movie } = useSuspenseQuery(movieQueryOptions(movieId));
  const cast = movie.credits.cast.filter((person) => person.profile_path).slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-24 sm:px-6 md:px-10">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={17} /> Back to movies
        </Link>

        <section aria-label={`${movie.title} player`}>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-card shadow-2xl">
            <iframe
              src={embedUrl(movie.id)}
              title={`${movie.title} player`}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <article className="border-b border-border py-7">
          <h1 className="font-display text-3xl leading-tight uppercase sm:text-4xl">{movie.title}</h1>
          {movie.tagline && <p className="mt-2 text-base text-muted-foreground">{movie.tagline}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 font-bold text-primary-foreground">
              <Star size={14} className="fill-current" /> {movie.vote_average.toFixed(1)}
            </span>
            {movie.release_date && (
              <span className="rounded bg-secondary px-2.5 py-1 text-secondary-foreground">
                {movie.release_date.slice(0, 4)}
              </span>
            )}
            {movie.runtime && (
              <span className="inline-flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1 text-secondary-foreground">
                <Clock3 size={14} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            )}
            {movie.genres.map((genre) => (
              <span key={genre.id} className="rounded border border-border px-2.5 py-1 text-muted-foreground">
                {genre.name}
              </span>
            ))}
          </div>

          <div className="mt-7 max-w-4xl">
            <h2 className="font-display text-lg uppercase">About this movie</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base">{movie.overview}</p>
          </div>
        </article>

        <section className="py-8" aria-labelledby="cast-heading">
          <h2 id="cast-heading" className="font-display text-xl uppercase">Cast</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-8">
            {cast.map((person) => (
              <div key={person.id} className="min-w-0">
                <img
                  src={IMG(person.profile_path, "w342")}
                  alt={person.name}
                  loading="lazy"
                  className="aspect-[2/3] w-full rounded object-cover"
                />
                <p className="mt-2 truncate text-sm font-semibold">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">{person.character}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MoviePageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 pt-24 sm:px-6 md:px-10">
      <div className="mx-auto aspect-video max-w-[1280px] animate-pulse rounded-md bg-card" />
    </div>
  );
}

function MoviePageError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl uppercase">Movie unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button
          onClick={() => router.invalidate()}
          className="mt-6 rounded bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}