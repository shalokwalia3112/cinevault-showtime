import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PosterCarousel } from "@/components/PosterCarousel";
import { PlayerModal } from "@/components/PlayerModal";
import { fetchGenres, fetchList, type Movie } from "@/lib/tmdb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineVault — Stream Trending Movies" },
      {
        name: "description",
        content:
          "Discover trending and popular movies on CineVault, with ratings, genres and instant playback.",
      },
      { property: "og:title", content: "CineVault — Stream Trending Movies" },
      {
        property: "og:description",
        content: "Trending and popular movies with ratings, genres and instant playback.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [playing, setPlaying] = useState<Movie | null>(null);
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetchList("/trending/movie/week"),
  });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => fetchList("/movie/popular") });
  const topRated = useQuery({ queryKey: ["top"], queryFn: () => fetchList("/movie/top_rated") });
  const genres = useQuery({ queryKey: ["genres"], queryFn: fetchGenres });

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <Hero movie={trending.data?.[0]} genres={genres.data} onPlay={setPlaying} />
      <div className="relative -mt-16">
        <PosterCarousel title="Trending Now" movies={trending.data} onPlay={setPlaying} />
        <PosterCarousel title="Popular on CineVault" movies={popular.data} onPlay={setPlaying} />
        <PosterCarousel title="Top Rated" movies={topRated.data} onPlay={setPlaying} />
      </div>
      <PlayerModal movie={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
