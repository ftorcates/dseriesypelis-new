import { unstable_cache } from "next/cache";
import { demoEpisodes, demoMovies, demoSeries } from "@/shared/lib/mock-data";
import type { EpisodeEvent, MediaItem } from "@/shared/lib/types";
import {
  getNotionEpisodesRange,
  getNotionMovieById,
  getNotionMovieCalendar,
  getNotionSeriesById,
  getNotionSeriesCatalog,
  getNotionSeriesFinales,
  getNotionSeriesPremieres,
  getNotionTopMovies,
  getNotionTopSeries,
  getNotionUpcomingMovies,
} from "@/server/notion/client";

export interface SeriesCatalogHub { series: MediaItem[]; isDemo: boolean }
export interface SeriesCalendarHub { series: MediaItem[]; isDemo: boolean }
export interface EpisodeWeekHub { episodes: EpisodeEvent[]; isDemo: boolean }
export interface SeriesLandingHub extends SeriesCatalogHub { episodes: EpisodeEvent[] }
export interface MovieLandingHub { movies: MediaItem[]; isDemo: boolean }
export interface MovieCalendarHub { events: MediaItem[]; isDemo: boolean }
export interface MovieRankingHub { movies: MediaItem[]; isDemo: boolean }
export interface ContentHub extends SeriesLandingHub { movies: MediaItem[] }

function dedupeSeries(items: MediaItem[]) {
  const unique = new Map<string, MediaItem>();
  for (const item of items) {
    const key = item.id || item.slug;
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()];
}

function dedupeMovies(items: MediaItem[]) {
  const unique = new Map<string, MediaItem>();
  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.releaseYear ?? ""}`;
    const current = unique.get(key);
    const itemIsPremiere = item.releaseTags?.includes("Estreno") ?? false;
    const currentIsPremiere = current?.releaseTags?.includes("Estreno") ?? false;
    if (!current || (itemIsPremiere && !currentIsPremiere)) unique.set(key, item);
  }
  return [...unique.values()];
}

function localDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentWeekRange() {
  const start = new Date();
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDate(start), end: localDate(end) };
}

async function loadSeriesCatalog(): Promise<SeriesCatalogHub> {
  try {
    const series = dedupeSeries(await getNotionSeriesCatalog(120));
    return { series: series.length ? series : demoSeries, isDemo: !series.length };
  } catch (error) {
    console.error("No se pudo cargar el catálogo de series desde Notion.", error);
    return { series: demoSeries, isDemo: true };
  }
}

async function loadSeriesPremieres(): Promise<SeriesCalendarHub> {
  try {
    const year = new Date().getFullYear();
    const series = await getNotionSeriesPremieres(`${year}-01-01`, `${year + 1}-12-31`);
    return { series: series.length ? series : demoSeries, isDemo: !series.length };
  } catch (error) {
    console.error("No se pudo cargar el calendario de estrenos desde Notion.", error);
    return { series: demoSeries, isDemo: true };
  }
}

async function loadSeriesFinales(): Promise<SeriesCalendarHub> {
  try {
    const year = new Date().getFullYear();
    const series = await getNotionSeriesFinales(`${year}-01-01`, `${year + 1}-12-31`);
    return { series: series.length ? series : demoSeries, isDemo: !series.length };
  } catch (error) {
    console.error("No se pudo cargar el calendario de finales desde Notion.", error);
    return { series: demoSeries, isDemo: true };
  }
}

async function loadEpisodeWeek(): Promise<EpisodeWeekHub> {
  try {
    const range = currentWeekRange();
    const episodes = await getNotionEpisodesRange(range.start, range.end);
    return { episodes: episodes.length ? episodes : demoEpisodes, isDemo: !episodes.length };
  } catch (error) {
    console.error("No se pudo cargar la agenda semanal desde Notion.", error);
    return { episodes: demoEpisodes, isDemo: true };
  }
}

async function loadSeriesRanking(): Promise<SeriesCatalogHub> {
  try {
    const series = await getNotionTopSeries();
    return { series: series.length ? series : sortByScore(demoSeries).slice(0, 50), isDemo: !series.length };
  } catch (error) {
    console.error("No se pudo cargar el ranking de series desde Notion.", error);
    return { series: sortByScore(demoSeries).slice(0, 50), isDemo: true };
  }
}

async function loadMovieLanding(): Promise<MovieLandingHub> {
  try {
    const movies = dedupeMovies(await getNotionUpcomingMovies(new Date().toISOString().slice(0, 10), 30));
    return { movies: movies.length ? movies : demoMovies, isDemo: !movies.length };
  } catch (error) {
    console.error("No se pudo cargar el radar de películas desde Notion.", error);
    return { movies: demoMovies, isDemo: true };
  }
}

async function loadMovieCalendar(): Promise<MovieCalendarHub> {
  try {
    const year = new Date().getFullYear();
    const events = await getNotionMovieCalendar(`${year}-01-01`, `${year + 1}-12-31`);
    return { events: events.length ? events : demoMovies, isDemo: !events.length };
  } catch (error) {
    console.error("No se pudo cargar el calendario de películas desde Notion.", error);
    return { events: demoMovies, isDemo: true };
  }
}

const getCachedMovieRanking = unstable_cache(async (year?: number): Promise<MovieRankingHub> => {
  try {
    const movies = await getNotionTopMovies(year);
    const fallback = year ? demoMovies.filter((movie) => movie.releaseYear === year) : demoMovies;
    return { movies: movies.length ? movies : fallback, isDemo: !movies.length };
  } catch (error) {
    console.error("No se pudo cargar el ranking de películas desde Notion.", error);
    return { movies: demoMovies, isDemo: true };
  }
}, ["d-series-movie-ranking-v5"], { revalidate: 900, tags: ["notion-movie-ranking"] });

const getCachedMovieDetail = unstable_cache(async (pageId: string) => getNotionMovieById(pageId), ["d-series-movie-detail-v4"], {
  revalidate: 900,
  tags: ["notion-movie-detail"],
});

const getCachedSeriesDetail = unstable_cache(async (pageId: string) => getNotionSeriesById(pageId), ["d-series-series-detail-v5"], {
  revalidate: 900,
  tags: ["notion-series-detail"],
});

export const getSeriesCatalogHub = unstable_cache(loadSeriesCatalog, ["d-series-series-catalog-v5"], { revalidate: 900, tags: ["notion-series-catalog"] });
export const getSeriesPremiereHub = unstable_cache(loadSeriesPremieres, ["d-series-series-premieres-v5"], { revalidate: 900, tags: ["notion-series-premieres"] });
export const getSeriesFinaleHub = unstable_cache(loadSeriesFinales, ["d-series-series-finales-v5"], { revalidate: 900, tags: ["notion-series-finales"] });
export const getEpisodeWeekHub = unstable_cache(loadEpisodeWeek, ["d-series-episode-week-v4"], { revalidate: 900, tags: ["notion-episode-week"] });
export const getSeriesRankingHub = unstable_cache(loadSeriesRanking, ["d-series-series-ranking-v6"], { revalidate: 900, tags: ["notion-series-ranking"] });
export const getMovieLandingHub = unstable_cache(loadMovieLanding, ["d-series-movie-landing-v4"], { revalidate: 900, tags: ["notion-movie-landing"] });
export const getMovieCalendarHub = unstable_cache(loadMovieCalendar, ["d-series-movie-calendar-v5"], { revalidate: 900, tags: ["notion-movie-calendar"] });

export async function getSeriesLandingHub(): Promise<SeriesLandingHub> {
  const [catalog, week] = await Promise.all([getSeriesCatalogHub(), getEpisodeWeekHub()]);
  return { series: catalog.series, episodes: week.episodes, isDemo: catalog.isDemo && week.isDemo };
}

export async function getMovieRankingHub(year?: number) {
  return getCachedMovieRanking(year);
}

export async function getMovieDetail(slug: string) {
  const notionId = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)?.[1];
  if (notionId) return getCachedMovieDetail(notionId);
  return demoMovies.find((movie) => movie.slug === slug);
}

export async function getSeriesDetail(slug: string) {
  const notionId = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)?.[1];
  if (notionId) return getCachedSeriesDetail(notionId);
  return demoSeries.find((series) => series.slug === slug);
}

export async function getContentHub(): Promise<ContentHub> {
  const [seriesHub, movieHub] = await Promise.all([getSeriesLandingHub(), getMovieLandingHub()]);
  return { ...seriesHub, movies: movieHub.movies, isDemo: seriesHub.isDemo && movieHub.isDemo };
}

export function sortByScore(items: MediaItem[]) {
  return [...items].filter((item) => item.score != null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function sortByDate(items: MediaItem[], field: "premiereDate" | "finaleDate" | "releaseDate") {
  return [...items]
    .filter((item) => item[field])
    .sort((a, b) => (a[field] ?? "").localeCompare(b[field] ?? ""));
}
