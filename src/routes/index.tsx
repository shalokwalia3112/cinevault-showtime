import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Tv, Film } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TrendingHeroCarousel } from "@/components/TrendingHeroCarousel";
import { PosterCarousel, SectionHeader } from "@/components/PosterCarousel";
import {
  fetchTrending,
  fetchTrendingTV,
  fetchTVByGenre,
  fetchMoviesByGenre,
  fetchTopRatedMovies,
  fetchLatestMovies,
  fetchGenres,
  type MediaItem,
} from "@/lib/tmdb";

const TMDB_GENRE_IDS = {
  action: 28,
  comedy: 35,
  horror: 27,
  scifi: 878,
  romance: 10749,
  thriller: 53,
  mystery: 9648,
  animation: 16,
  family: 10751,
  drama: 18,
} as const;

const catalogQueryOptions = queryOptions({
  queryKey: ["home-catalog-v2"],
  queryFn: async () => {
    const [
      trending,
      trendingTV,
      dramaTV,
      actionScifiTV,
      actionMovies,
      comedyMovies,
      horrorMovies,
      scifiMovies,
      romanceMovies,
      thrillerMovies,
      animationMovies,
      topRatedMovies,
      latestMovies,
      genres,
    ] = await Promise.all([
      fetchTrending("week"),
      fetchTrendingTV(),
      fetchTVByGenre(TMDB_GENRE_IDS.drama),
      fetchTVByGenre(TMDB_GENRE_IDS.action),
      fetchMoviesByGenre(TMDB_GENRE_IDS.action),
      fetchMoviesByGenre(TMDB_GENRE_IDS.comedy),
      fetchMoviesByGenre(TMDB_GENRE_IDS.horror),
      fetchMoviesByGenre(TMDB_GENRE_IDS.scifi),
      fetchMoviesByGenre(TMDB_GENRE_IDS.romance),
      fetchMoviesByGenre(TMDB_GENRE_IDS.thriller),
      fetchMoviesByGenre(TMDB_GENRE_IDS.animation),
      fetchTopRatedMovies(),
      fetchLatestMovies(),
      fetchGenres(),
    ]);
    return {
      trending,
      trendingTV,
      dramaTV,
      actionScifiTV,
      actionMovies,
      comedyMovies,
      horrorMovies,
      scifiMovies,
      romanceMovies,
      thrillerMovies,
      animationMovies,
      topRatedMovies,
      latestMovies,
      genres,
    };
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
          "Discover trending movies and TV series, top-rated Hollywood films, Indian web series, K-dramas, Korean cinema and anime. Stream across our 4-server ecosystem.",
      },
      { property: "og:title", content: "CineVault — Top Global Movies & Series" },
      {
        property: "og:description",
        content:
          "Trending today: top movies and TV series across action, comedy, horror, sci-fi, romance, thriller, animation and more.",
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
      <TrendingHeroCarousel items={data.trending} genres={data.genres} onPlay={openTitle} />

      <div className="relative -mt-16">
        {/* TV Series Section */}
        <SectionHeader
          label="TV Series"
          icon={<Tv size={24} className="text-primary" />}
        />
        <PosterCarousel
          title="Trending TV Shows"
          items={data.trendingTV}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="High-Rated Drama Series"
          items={data.dramaTV}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Action & Sci-Fi Shows"
          items={data.actionScifiTV}
          onPlay={openTitle}
        />

        {/* Movies Section */}
        <SectionHeader
          label="Movies"
          icon={<Film size={24} className="text-primary" />}
        />
        <PosterCarousel
          title="Action Movies"
          items={data.actionMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Comedy Movies"
          items={data.comedyMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Horror Movies"
          items={data.horrorMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Sci-Fi & Fantasy"
          items={data.scifiMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Romance Movies"
          items={data.romanceMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Thriller & Mystery Movies"
          items={data.thrillerMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Animation & Family Movies"
          items={data.animationMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Top Rated Classics"
          items={data.topRatedMovies}
          onPlay={openTitle}
        />
        <PosterCarousel
          title="Latest Releases"
          items={data.latestMovies}
          onPlay={openTitle}
        />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return <div className="min-h-screen animate-pulse bg-card" />;
}

function HomeError({ error }: { error: Error }) {
  return (
    <div role="alert" className="min-h-screen bg-background px-6 pt-32 text-muted-foreground">
      {error.message}
    </div>
  );
}
