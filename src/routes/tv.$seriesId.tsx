import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clapperboard, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fetchTVDetails, IMG, tvEmbedUrl } from "@/lib/tmdb";

const seriesQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["tv", seriesId],
    queryFn: () => {
      const id = Number(seriesId);
      if (!Number.isInteger(id) || id <= 0) throw new Error("This series could not be found.");
      return fetchTVDetails(id);
    },
  });

export const Route = createFileRoute("/tv/$seriesId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(seriesQueryOptions(params.seriesId)),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Watch on CineVault` : "Series — CineVault";
    const description = loaderData?.overview || "Watch this series and explore its details on CineVault.";
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "video.tv_show" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  pendingComponent: SeriesPageSkeleton,
  errorComponent: SeriesPageError,
  notFoundComponent: () => <p className="p-10 text-muted-foreground">Series not found.</p>,
  component: SeriesPage,
});

function SeriesPage() {
  const { seriesId } = Route.useParams();
  const { data: series } = useSuspenseQuery(seriesQueryOptions(seriesId));
  const cast = series.credits.cast.filter((person) => person.profile_path).slice(0, 8);
  const runtime = series.episode_run_time.find((minutes) => minutes > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-24 sm:px-6 md:px-10">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={17} /> Back to entertainment
        </Link>

        <section aria-label={`${series.name} player`}>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-card shadow-2xl">
            <iframe
              src={tvEmbedUrl(series.id)}
              title={`${series.name} player`}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <AdBanner />

        <article className="border-b border-border py-7">
          <h1 className="font-display text-3xl leading-tight uppercase sm:text-4xl">{series.name}</h1>
          {series.tagline && <p className="mt-2 text-base text-muted-foreground">{series.tagline}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 font-bold text-primary-foreground">
              <Star size={14} className="fill-current" /> {series.vote_average.toFixed(1)}
            </span>
            {series.first_air_date && <span className="inline-flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1"><CalendarDays size={14} />{series.first_air_date.slice(0, 4)}</span>}
            <span className="inline-flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1"><Clapperboard size={14} />{series.number_of_seasons} {series.number_of_seasons === 1 ? "season" : "seasons"}</span>
            {runtime && <span className="rounded bg-secondary px-2.5 py-1">{runtime} min episodes</span>}
            {series.genres.map((genre) => <span key={genre.id} className="rounded border border-border px-2.5 py-1 text-muted-foreground">{genre.name}</span>)}
          </div>
          <div className="mt-7 max-w-4xl">
            <h2 className="font-display text-lg uppercase">About this series</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base">{series.overview}</p>
          </div>
        </article>

        <AdBanner />

        <section className="py-8" aria-labelledby="series-cast-heading">
          <h2 id="series-cast-heading" className="font-display text-xl uppercase">Cast</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-8">
            {cast.map((person) => (
              <div key={person.id} className="min-w-0">
                <img src={IMG(person.profile_path, "w342")} alt={person.name} loading="lazy" className="aspect-[2/3] w-full rounded object-cover" />
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

function AdBanner() {
  return <div aria-label="Advertisement" className="mx-auto my-6 flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-md border border-border/60 bg-card/30 text-xs tracking-widest text-muted-foreground/50 uppercase">Advertisement</div>;
}

function SeriesPageSkeleton() {
  return <div className="min-h-screen bg-background px-4 pt-24"><div className="mx-auto aspect-video max-w-[1280px] animate-pulse rounded-md bg-card" /></div>;
}

function SeriesPageError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl uppercase">Series unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button onClick={() => router.invalidate()} className="mt-6 rounded bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Try again</button>
      </div>
    </main>
  );
}