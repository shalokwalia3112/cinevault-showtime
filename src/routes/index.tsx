import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PosterCarousel } from "@/components/PosterCarousel";
import {
  fetchCuratedMovieRow,
  fetchCuratedTVRow,
  fetchGenres,
  type MediaItem,
} from "@/lib/tmdb";

const catalogQueryOptions = queryOptions({
  queryKey: ["home-catalog"],
  queryFn: async () => {
    const [hollywoodSeries, hollywoodMovies, bollywoodMovies, indianSeries, koreanMovies, koreanDramas, animeSeries, genres] =
      await Promise.all([
        fetchCuratedTVRow({ with_original_language: "en", with_origin_country: "US|GB" }),
        fetchCuratedMovieRow({ with_original_language: "en", region: "US" }),
        fetchCuratedMovieRow({ with_original_language: "hi", region: "IN" }),
        fetchCuratedTVRow({
          with_original_language: "hi",
          with_origin_country: "IN",
          without_genres: "10766",
        }),
        fetchCuratedMovieRow({ with_original_language: "ko", region: "KR" }),
        fetchCuratedTVRow({ with_original_language: "ko", with_origin_country: "KR", with_genres: "18" }),
        fetchCuratedTVRow({ with_original_language: "ja", with_origin_country: "JP", with_genres: "16" }),
        fetchGenres(),
      ]);
    return { hollywoodSeries, hollywoodMovies, bollywoodMovies, indianSeries, koreanMovies, koreanDramas, animeSeries, genres };
  },
  staleTime: 30 * 60_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineVault — Top Global Movies & Series" },
      {
        name: "description",
        content:
          "Discover top-rated Hollywood movies and series, Indian web series, Bollywood films, K-dramas, Korean cinema and anime.",
      },
      { property: "og:title", content: "CineVault — Top Global Movies & Series" },
      {
        property: "og:description",
        content: "Top-rated Hollywood movies and series, Indian web series, and acclaimed entertainment from Korea and Japan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  pendingComponent: HomeSkeleton,
  errorComponent: HomeError,
  notFoundComponent: () => <p className="p-10">No curated titles are available.</p>,
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const openTitle = (item: MediaItem) => {
    if (item.media_type === "tv") {
      return navigate({ to: "/tv/$tvId", params: { tvId: String(item.id) } });
    }
    return navigate({ to: "/movie/$movieId", params: { movieId: String(item.id) } });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <Hero item={data.hollywoodSeries[0]} genres={data.genres} onPlay={openTitle} />
      <div className="relative -mt-16">
        <PosterCarousel title="Top Rated Hollywood Series" items={data.hollywoodSeries} onPlay={openTitle} />
        <PosterCarousel title="Top Rated Hollywood Movies" items={data.hollywoodMovies} onPlay={openTitle} />
        <PosterCarousel title="Popular Bollywood Blockbusters" items={data.bollywoodMovies} onPlay={openTitle} />
        <PosterCarousel title="Trending Indian Web Series" items={data.indianSeries} onPlay={openTitle} />
        <PosterCarousel title="Top Rated Korean Cinema" items={data.koreanMovies} onPlay={openTitle} />
        <PosterCarousel title="Trending Korean Dramas" items={data.koreanDramas} onPlay={openTitle} />
        <PosterCarousel title="Popular Anime Series" items={data.animeSeries} onPlay={openTitle} />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return <div className="min-h-screen animate-pulse bg-card" />;
}

function HomeError({ error }: { error: Error }) {
  return <div role="alert" className="min-h-screen bg-background px-6 pt-32 text-muted-foreground">{error.message}</div>;
}
