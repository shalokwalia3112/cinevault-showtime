import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StreamingControls, type StreamingServer } from "@/components/StreamingControls";
import { Button } from "@/components/ui/button";
import { fetchTVDetails, IMG, tvServerUrl } from "@/lib/tmdb";

const tvQueryOptions = (tvId: string) =>
  queryOptions({
    queryKey: ["tv", tvId],
    queryFn: () => {
      const id = Number(tvId);
      if (!Number.isInteger(id) || id <= 0) throw new Error("This series could not be found.");
      return fetchTVDetails(id);
    },
  });

export const Route = createFileRoute("/tv/$tvId")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(tvQueryOptions(params.tvId)),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Watch on CineVault` : "Series — CineVault";
    const description =
      loaderData?.overview || "Watch this series and explore its details on CineVault.";
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
  pendingComponent: TVPageSkeleton,
  errorComponent: TVPageError,
  notFoundComponent: () => <p className="px-6 pt-28">Series not found.</p>,
  component: TVPage,
});

function TVPage() {
  const { tvId } = Route.useParams();
  const { data: show } = useSuspenseQuery(tvQueryOptions(tvId));
  const seasons = show.seasons.filter(
    (season) => season.season_number > 0 && season.episode_count > 0,
  );
  const [season, setSeason] = useState(seasons[0]?.season_number ?? 1);
  const selectedSeason = seasons.find((item) => item.season_number === season);
  const [episode, setEpisode] = useState(1);
  const [server, setServer] = useState<StreamingServer>(1);
  const cast = show.credits.cast.filter((person) => person.profile_path).slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-24 sm:px-6 md:px-10">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={17} /> Back to catalog
        </Link>

        <section aria-label={`${show.name} player`}>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-card shadow-2xl">
            <iframe
              key={`${server}-${season}-${episode}`}
              src={tvServerUrl(server, show.id, season, episode)}
              title={`${show.name}, season ${season}, episode ${episode}`}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <StreamingControls
            activeServer={server}
            onServerChange={setServer}
            seasonControl={(
              <select
              aria-label="Season"
              value={season}
              onChange={(event) => {
                setSeason(Number(event.target.value));
                setEpisode(1);
              }}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
              >
                {seasons.map((item) => (
                  <option key={item.id} value={item.season_number}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            episodeControl={(
              <select
              aria-label="Episode"
              value={episode}
              onChange={(event) => setEpisode(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
              >
                {Array.from(
                  { length: selectedSeason?.episode_count ?? 1 },
                  (_, index) => index + 1,
                ).map((number) => (
                  <option key={number} value={number}>
                    Episode {number}
                  </option>
                ))}
              </select>
            )}
          />
        </section>

        <article className="border-b border-border py-7">
          <h1 className="font-display text-3xl leading-tight uppercase sm:text-4xl">{show.name}</h1>
          {show.tagline && <p className="mt-2 text-base text-muted-foreground">{show.tagline}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 font-bold text-primary-foreground">
              <Star size={14} className="fill-current" /> {show.vote_average.toFixed(1)}
            </span>
            {show.first_air_date && (
              <span className="rounded bg-secondary px-2.5 py-1">
                {show.first_air_date.slice(0, 4)}
              </span>
            )}
            <span className="rounded bg-secondary px-2.5 py-1">
              {show.number_of_seasons} seasons
            </span>
            <span className="rounded bg-secondary px-2.5 py-1">
              {show.number_of_episodes} episodes
            </span>
            {show.genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded border border-border px-2.5 py-1 text-muted-foreground"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <div className="mt-7 max-w-4xl">
            <h2 className="font-display text-lg uppercase">About this series</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base">
              {show.overview}
            </p>
          </div>
        </article>

        <section className="py-8" aria-labelledby="tv-cast-heading">
          <h2 id="tv-cast-heading" className="font-display text-xl uppercase">
            Cast
          </h2>
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

function TVPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 pt-24">
      <div className="mx-auto aspect-video max-w-[1280px] animate-pulse rounded-md bg-card" />
    </div>
  );
}

function TVPageError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl uppercase">Series unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <Button className="mt-6" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
