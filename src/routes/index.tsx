import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PosterCarousel } from "@/components/PosterCarousel";
import { fetchGenres, fetchHomeHub, type MediaItem } from "@/lib/tmdb";

const homeQueryOptions = queryOptions({
  queryKey: ["home", "global-hub"],
  queryFn: fetchHomeHub,
  staleTime: 10 * 60_000,
});

const genresQueryOptions = queryOptions({
  queryKey: ["genres", "movie"],
  queryFn: fetchGenres,
  staleTime: 24 * 60 * 60_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineVault — Stream Trending Movies" },
      {
        name: "description",
        content:
          "Discover global movies, Bollywood, K-dramas, anime and popular series with instant playback.",
      },
      { property: "og:title", content: "CineVault — Stream Trending Movies" },
      {
        property: "og:description",
        content: "A global entertainment hub for Hollywood, Indian cinema, K-dramas and anime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homeQueryOptions),
      context.queryClient.ensureQueryData(genresQueryOptions),
    ]),
  pendingComponent: HomeSkeleton,
  errorComponent: HomeError,
  notFoundComponent: () => <p className="p-10 text-muted-foreground">No entertainment found.</p>,
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(homeQueryOptions);
  const { data: genres } = useSuspenseQuery(genresQueryOptions);
  const openMedia = (item: MediaItem) => {
    if (item.mediaType === "tv") {
      navigate({ to: "/tv/$seriesId", params: { seriesId: String(item.id) } });
      return;
    }
    navigate({ to: "/movie/$movieId", params: { movieId: String(item.id) } });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <Hero movie={data.hero ?? undefined} genres={genres} onPlay={openMedia} />
      <div className="relative -mt-16 space-y-10">
        {data.sections.map((section) => (
          <section key={section.title} aria-labelledby={`section-${section.eyebrow}`}>
            <header className="mb-1 px-6 md:px-10">
              <p className="text-xs font-bold tracking-[0.24em] text-primary uppercase">{section.eyebrow}</p>
              <h2 id={`section-${section.eyebrow}`} className="mt-1 font-display text-2xl uppercase md:text-3xl">
                {section.title}
              </h2>
            </header>
            {section.rows.map((row) => (
              <PosterCarousel key={row.title} title={row.title} movies={row.items} onPlay={openMedia} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return <div className="min-h-screen animate-pulse bg-background"><div className="h-[85vh] bg-card" /></div>;
}

function HomeError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl uppercase">Entertainment unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button onClick={() => router.invalidate()} className="mt-6 rounded bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Try again</button>
      </div>
    </main>
  );
}
