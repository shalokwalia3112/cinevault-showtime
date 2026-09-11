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
  get<{ results: Movie[] }>(path, params).then((d) => d.results.filter((m) => m.poster_path));

export const fetchGenres = () =>
  get<{ genres: { id: number; name: string }[] }>("/genre/movie/list").then((d) => d.genres);

export const searchMovies = (query: string) =>
  fetchList("/search/movie", { query, include_adult: "false" });

export const genreNames = (
  ids: number[] | undefined,
  genres: { id: number; name: string }[] | undefined,
) =>
  (ids ?? [])
    .map((id) => genres?.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3) as string[];

export const embedUrl = (id: number) => `https://vidlink.pro/embed/movie/${id}`;
