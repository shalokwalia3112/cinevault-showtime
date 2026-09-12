import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PosterCarousel } from "@/components/PosterCarousel";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const openMovie = (movie: Movie) =>
    navigate({ to: "/movie/$movieId", params: { movieId: String(movie.id) } });
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
      <Hero movie={trending.data?.[0]} genres={genres.data} onPlay={openMovie} />
      <div className="relative -mt-16">
        <PosterCarousel title="Trending Now" movies={trending.data} onPlay={openMovie} />
        <PosterCarousel title="Popular on CineVault" movies={popular.data} onPlay={openMovie} />
        <PosterCarousel title="Top Rated" movies={topRated.data} onPlay={openMovie} />
      </div>
    </div>
  );
}
