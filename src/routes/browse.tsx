import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { PosterCard } from "@/components/PosterCarousel";
import { PlayerModal } from "@/components/PlayerModal";
import { fetchList, searchMovies, type Movie } from "@/lib/tmdb";

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Browse Movies — CineVault" },
      {
        name: "description",
        content: "Browse and search the CineVault movie catalogue by title, rating and release year.",
      },
      { property: "og:title", content: "Browse Movies — CineVault" },
      {
        property: "og:description",
        content: "Search thousands of movies and start watching instantly on CineVault.",
      },
    ],
  }),
  component: Browse,
});

function Browse() {
  const { q } = Route.useSearch();
  const [playing, setPlaying] = useState<Movie | null>(null);

  const movies = useQuery({
    queryKey: ["browse", q],
    queryFn: () => (q ? searchMovies(q) : fetchList("/discover/movie", { sort_by: "popularity.desc" })),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 pt-28 pb-16 md:px-10">
        <h1 className="mb-6 font-display text-2xl tracking-[0.2em] uppercase">
          {q ? `Results for "${q}"` : "Browse Movies"}
        </h1>
        <div className="flex flex-wrap gap-3">
          {movies.data?.map((m) => <PosterCard key={m.id} movie={m} onPlay={setPlaying} />)}
        </div>
        {movies.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No movies found.</p>
        )}
      </main>
      <PlayerModal movie={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
