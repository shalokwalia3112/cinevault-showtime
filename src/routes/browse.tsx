import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { PosterCard } from "@/components/PosterCarousel";
import { searchCatalog, type MediaItem } from "@/lib/tmdb";

const searchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["catalog-search", query],
    queryFn: () => (query ? searchCatalog(query) : Promise.resolve([])),
  });

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Search Movies & Series — CineVault" },
      {
        name: "description",
        content: "Search CineVault's global movie and television catalog by title.",
      },
      { property: "og:title", content: "Search Movies & Series — CineVault" },
      {
        property: "og:description",
        content: "Search movies and television series from CineVault's global catalog.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(searchQueryOptions(deps.q)),
  pendingComponent: () => <div className="min-h-screen animate-pulse bg-card" />,
  errorComponent: ({ error }) => (
    <div role="alert" className="px-6 pt-28">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <p className="px-6 pt-28">No titles found.</p>,
  component: Browse,
});

function Browse() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { data: results } = useSuspenseQuery(searchQueryOptions(q));
  const openTitle = (item: MediaItem) => {
    if (item.media_type === "tv") {
      return navigate({ to: "/tv/$tvId", params: { tvId: String(item.id) } });
    }
    return navigate({ to: "/movie/$movieId", params: { movieId: String(item.id) } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 pt-28 pb-16 md:px-10">
        <h1 className="mb-6 font-display text-2xl tracking-[0.2em] uppercase">
          {q ? `Results for "${q}"` : "Search the CineVault catalog"}
        </h1>
        {!q && (
          <p className="text-sm text-muted-foreground">
            Enter a movie or series title in the search bar.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {results.map((item) => (
            <PosterCard key={`${item.media_type}-${item.id}`} item={item} onPlay={openTitle} />
          ))}
        </div>
        {q && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No movies or series found.</p>
        )}
      </main>
    </div>
  );
}
