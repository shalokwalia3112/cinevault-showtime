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
  media_type?: "movie";
};

export type TVShow = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: "tv";
};

export type MediaItem = (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" });

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

export type TVDetails = Omit<TVShow, "genre_ids"> & {
  genres: { id: number; name: string }[];
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: { id: number; name: string; season_number: number; episode_count: number }[];
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
    d.results.filter((m) => m.poster_path).map((m) => ({ ...m, media_type: "movie" as const })),
  );

export const fetchTVList = (path: string, params?: Record<string, string>) =>
  get<{ results: TVShow[] }>(path, params).then((d) =>
    d.results
      .filter((show) => show.poster_path)
      .map((show) => ({ ...show, media_type: "tv" as const })),
  );

export const fetchGenres = async () => {
  const [movieGenres, tvGenres] = await Promise.all([
    get<{ genres: { id: number; name: string }[] }>("/genre/movie/list"),
    get<{ genres: { id: number; name: string }[] }>("/genre/tv/list"),
  ]);
  return [
    ...new Map(
      [...movieGenres.genres, ...tvGenres.genres].map((genre) => [genre.id, genre]),
    ).values(),
  ];
};

export const searchCatalog = (query: string) =>
  get<{ results: Array<Movie | TVShow | ({ media_type: "person" } & Record<string, unknown>)> }>(
    "/search/multi",
    { query, include_adult: "false" },
  ).then(
    (data) =>
      data.results
        .filter(
          (item): item is Movie | TVShow =>
            (item.media_type === "movie" || item.media_type === "tv") && Boolean(item.poster_path),
        )
        .map((item) => ({ ...item, media_type: item.media_type as "movie" | "tv" })) as MediaItem[],
  );

export const fetchMovieDetails = (id: number) =>
  get<MovieDetails>(`/movie/${id}`, { append_to_response: "credits" });

export const fetchTVDetails = (id: number) =>
  get<TVDetails>(`/tv/${id}`, { append_to_response: "credits" });

const rankCatalog = (items: MediaItem[]) =>
  [...items].sort((a, b) => {
    const aStrong = a.vote_average >= 7 ? 1 : 0;
    const bStrong = b.vote_average >= 7 ? 1 : 0;
    return bStrong - aStrong || b.vote_average - a.vote_average;
  });

const mergeCatalog = (lists: MediaItem[][]) => {
  const unique = new Map<string, MediaItem>();
  lists.flat().forEach((item) => unique.set(`${item.media_type}-${item.id}`, item));
  return rankCatalog([...unique.values()]);
};

export const fetchCuratedMovieRow = async (filters: Record<string, string>) =>
  mergeCatalog(
    await Promise.all([
      fetchList("/discover/movie", {
        ...filters,
        sort_by: "vote_average.desc",
        "vote_count.gte": "150",
      }),
      fetchList("/discover/movie", { ...filters, sort_by: "popularity.desc" }),
    ]),
  );

export const fetchCuratedTVRow = async (filters: Record<string, string>) =>
  mergeCatalog(
    await Promise.all([
      fetchTVList("/discover/tv", {
        ...filters,
        sort_by: "vote_average.desc",
        "vote_count.gte": "150",
      }),
      fetchTVList("/discover/tv", { ...filters, sort_by: "popularity.desc" }),
    ]),
  );

export const fetchTrending = async (
  window: "day" | "week" = "week",
): Promise<MediaItem[]> =>
  get<{ results: Array<Movie | TVShow & { media_type: "movie" | "tv" }> }>(
    "/trending/all",
    { time_window: window },
  ).then((data) =>
    data.results
      .filter((item) => item.backdrop_path && (item.media_type === "movie" || item.media_type === "tv"))
      .slice(0, 10)
      .map((item) => ({ ...item, media_type: item.media_type as "movie" | "tv" })),
  );

export const fetchTrendingMovies = async (): Promise<MediaItem[]> =>
  get<{ results: Movie[] & { media_type?: "movie" }[] }>("/trending/movie/week").then((data) =>
    data.results
      .filter((m) => m.poster_path)
      .slice(0, 20)
      .map((m) => ({ ...m, media_type: "movie" as const })),
  );

export const fetchTrendingTV = async (): Promise<MediaItem[]> =>
  get<{ results: TVShow[] & { media_type?: "tv" }[] }>("/trending/tv/week").then((data) =>
    data.results
      .filter((s) => s.poster_path)
      .slice(0, 20)
      .map((s) => ({ ...s, media_type: "tv" as const })),
  );

export const fetchMoviesByGenre = async (genreId: number): Promise<MediaItem[]> =>
  fetchCuratedMovieRow({ with_genres: String(genreId) });

export const fetchTVByGenre = async (genreId: number): Promise<MediaItem[]> =>
  fetchCuratedTVRow({ with_genres: String(genreId) });

export const fetchTopRatedMovies = async (): Promise<MediaItem[]> =>
  fetchList("/movie/top_rated").then((items) => items.slice(0, 20));

export const fetchLatestMovies = async (): Promise<MediaItem[]> =>
  fetchList("/movie/now_playing").then((items) => items.slice(0, 20));

export const mediaTitle = (item: MediaItem) =>
  item.media_type === "movie" ? item.title : item.name;

export const mediaDate = (item: MediaItem) =>
  item.media_type === "movie" ? item.release_date : item.first_air_date;

export const genreNames = (
  ids: number[] | undefined,
  genres: { id: number; name: string }[] | undefined,
) =>
  (ids ?? [])
    .map((id) => genres?.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3) as string[];

export const embedUrl = (id: number) => `https://vidlink.pro/movie/${id}`;

export const tvEmbedUrl = (id: number, season: number, episode: number) =>
  `https://vidlink.pro/tv/${id}/${season}/${episode}`;

export const movieServerUrl = (server: 1 | 2 | 3 | 4, id: number) => {
  if (server === 2) return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
  if (server === 3) return `https://www.2embed.cc/embed/${id}`;
  if (server === 4) return `https://vidsrc.cc/v2/embed/movie/${id}`;
  return embedUrl(id);
};

export const tvServerUrl = (
  server: 1 | 2 | 3 | 4,
  id: number,
  season: number,
  episode: number,
) => {
  if (server === 2) {
    return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
  }
  if (server === 3) return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
  if (server === 4) return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
  return tvEmbedUrl(id, season, episode);
};
