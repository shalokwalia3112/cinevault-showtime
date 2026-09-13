const API_KEY = "72a973eacb92793f0dd2a67b5ee47e83";
const BASE = "https://api.themoviedb.org/3";

export const IMG = (path: string | null, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  genre_ids?: number[];
  mediaType?: "movie";
};

export type TVShow = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  genre_ids?: number[];
  mediaType: "tv";
};

export type MediaItem = Movie | TVShow;

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type MovieDetails = Omit<Movie, "genre_ids"> & {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string;
  credits: { cast: CastMember[] };
};

export type TVDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  tagline: string;
  number_of_seasons: number;
  credits: { cast: CastMember[] };
};

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return (await res.json()) as T;
}

export const fetchList = (path: string, params?: Record<string, string>) =>
  get<{ results: Movie[] }>(path, params).then((d) =>
    d.results.filter((movie) => movie.poster_path).map((movie) => ({ ...movie, mediaType: "movie" as const })),
  );

type TMDBTVResult = Omit<TVShow, "title" | "release_date" | "mediaType"> & {
  name: string;
  first_air_date?: string;
};

export const fetchTVList = (path: string, params?: Record<string, string>) =>
  get<{ results: TMDBTVResult[] }>(path, params).then((data) =>
    data.results
      .filter((show) => show.poster_path)
      .map((show) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
        mediaType: "tv" as const,
      })),
  );

export const fetchGenres = () =>
  get<{ genres: { id: number; name: string }[] }>("/genre/movie/list").then((d) => d.genres);

export const searchMovies = (query: string) =>
  fetchList("/search/movie", { query, include_adult: "false" });

export const fetchMovieDetails = (id: number) =>
  get<MovieDetails>(`/movie/${id}`, { append_to_response: "credits" });

export const fetchTVDetails = (id: number) =>
  get<TVDetails>(`/tv/${id}`, { append_to_response: "credits" });

export type HomeSection = {
  eyebrow: string;
  title: string;
  rows: { title: string; items: MediaItem[] }[];
};

const settled = async <T>(request: Promise<T>, fallback: T) => {
  try {
    return await request;
  } catch {
    return fallback;
  }
};

const mergeMovies = (lists: Movie[][]) =>
  Array.from(new Map(lists.flat().map((movie) => [movie.id, movie])).values())
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 20);

export async function fetchHomeHub(): Promise<{ hero: Movie | null; sections: HomeSection[] }> {
  const [
    trending,
    latest,
    westernTV,
    bollywood,
    telugu,
    tamil,
    malayalam,
    indianTV,
    koreanTV,
    anime,
  ] = await Promise.all([
    settled(fetchList("/trending/movie/week"), []),
    settled(fetchList("/movie/now_playing", { region: "US", language: "en-US" }), []),
    settled(fetchTVList("/discover/tv", { with_original_language: "en", sort_by: "popularity.desc" }), []),
    settled(fetchList("/discover/movie", { with_original_language: "hi", region: "IN", sort_by: "popularity.desc" }), []),
    settled(fetchList("/discover/movie", { with_original_language: "te", region: "IN", sort_by: "popularity.desc" }), []),
    settled(fetchList("/discover/movie", { with_original_language: "ta", region: "IN", sort_by: "popularity.desc" }), []),
    settled(fetchList("/discover/movie", { with_original_language: "ml", region: "IN", sort_by: "popularity.desc" }), []),
    settled(fetchTVList("/discover/tv", { with_origin_country: "IN", sort_by: "popularity.desc" }), []),
    settled(fetchTVList("/discover/tv", { with_original_language: "ko", watch_region: "KR", sort_by: "popularity.desc" }), []),
    settled(fetchTVList("/discover/tv", { with_original_language: "ja", with_genres: "16", watch_region: "JP", sort_by: "popularity.desc" }), []),
  ]);

  return {
    hero: trending[0] ?? latest[0] ?? null,
    sections: [
      {
        eyebrow: "Worldwide",
        title: "Global Hollywood & Western Blockbusters",
        rows: [
          { title: "Trending Global Movies", items: trending },
          { title: "Latest Hollywood Releases", items: latest },
          { title: "Popular Western TV Series", items: westernTV },
        ],
      },
      {
        eyebrow: "India",
        title: "Indian Cinema / Bollywood & South Hub",
        rows: [
          { title: "Trending Bollywood Movies", items: bollywood },
          { title: "Popular South Indian Cinema", items: mergeMovies([telugu, tamil, malayalam]) },
          { title: "Hot Indian Web Series & TV Shows", items: indianTV },
        ],
      },
      {
        eyebrow: "East Asia",
        title: "Anime & K-Dramas",
        rows: [
          { title: "Popular Korean Dramas", items: koreanTV },
          { title: "Trending Japanese Anime Series", items: anime },
        ],
      },
    ],
  };
}

export const genreNames = (
  ids: number[] | undefined,
  genres: { id: number; name: string }[] | undefined,
) =>
  (ids ?? [])
    .map((id) => genres?.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3) as string[];

export const embedUrl = (id: number) => `https://vidlink.pro/movie/${id}`;

export const tvEmbedUrl = (id: number, season = 1, episode = 1) =>
  `https://vidlink.pro/tv/${id}/${season}/${episode}`;
