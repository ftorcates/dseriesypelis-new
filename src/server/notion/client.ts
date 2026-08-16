import type { EpisodeEvent, MediaItem, MediaStatus } from "@/shared/lib/types";

const NOTION_VERSION = "2026-03-11";

type NotionProperty = {
  type?: string;
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  number?: number | null;
  select?: { name?: string } | null;
  status?: { name?: string } | null;
  multi_select?: Array<{ name?: string }>;
  date?: { start?: string; end?: string | null } | null;
  checkbox?: boolean;
  url?: string | null;
  files?: Array<{ file?: { url?: string }; external?: { url?: string } }>;
  formula?: { type?: string; string?: string | null; number?: number | null; boolean?: boolean; date?: { start?: string } | null };
};

type NotionPage = {
  id: string;
  url?: string;
  properties?: Record<string, NotionProperty>;
};

type QueryResponse = {
  results: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

function text(property?: NotionProperty) {
  if (!property) return "";
  if (property.type === "title") return property.title?.map((item) => item.plain_text ?? "").join("") ?? "";
  if (property.type === "rich_text") return property.rich_text?.map((item) => item.plain_text ?? "").join("") ?? "";
  if (property.type === "select") return property.select?.name ?? "";
  if (property.type === "status") return property.status?.name ?? "";
  if (property.type === "formula") {
    if (property.formula?.type === "string") return property.formula.string ?? "";
    if (property.formula?.type === "number") return String(property.formula.number ?? "");
  }
  return "";
}

function number(property?: NotionProperty) {
  if (!property) return undefined;
  if (property.type === "number") return property.number ?? undefined;
  if (property.type === "formula" && property.formula?.type === "number") return property.formula.number ?? undefined;
  const parsed = Number.parseFloat(text(property).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function date(property?: NotionProperty) {
  if (property?.type === "date") return property.date?.start?.slice(0, 10);
  if (property?.type === "formula" && property.formula?.type === "date") return property.formula.date?.start?.slice(0, 10);
  return undefined;
}

function multi(property?: NotionProperty) {
  return property?.multi_select?.flatMap((item) => (item.name ? [item.name] : [])) ?? [];
}

function file(property?: NotionProperty) {
  const first = property?.files?.[0];
  return first?.file?.url ?? first?.external?.url;
}

function checked(property?: NotionProperty) {
  if (property?.type === "checkbox") return property.checkbox ?? false;
  if (property?.type === "formula" && property.formula?.type === "boolean") return property.formula.boolean ?? false;
  return false;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function posterTone(index: number) {
  return ["indigo", "crimson", "moss", "amber", "steel", "vermillion", "violet", "ocean"][index % 8];
}

function mapStatus(value: string, premiereDate?: string): MediaStatus {
  if (premiereDate && new Date(premiereDate) > new Date()) return "Próximamente";
  if (/renov/i.test(value)) return "Renovada";
  if (/mini/i.test(value)) return "Miniserie";
  if (/final|cancel/i.test(value)) return "Finalizada";
  return "En emisión";
}

async function queryDataSource(dataSourceId: string, query: Record<string, unknown> = {}, maxResults = Number.POSITIVE_INFINITY): Promise<NotionPage[]> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return [];

  const results: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({ page_size: Math.min(100, maxResults), ...query, ...(cursor ? { start_cursor: cursor } : {}) }),
    });

    if (!response.ok) throw new Error(`Notion respondió ${response.status}`);
    const data = (await response.json()) as QueryResponse;
    results.push(...data.results.slice(0, Math.max(0, maxResults - results.length)));
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor && results.length < maxResults);

  return results;
}

function normalizeSeriesPage(page: NotionPage, index = 0): MediaItem | undefined {
    const p = page.properties ?? {};
    const title = text(p["Título"] ?? p["Titulo"] ?? p["Name"]);
    if (!title) return undefined;
    const premiereDate = date(p["FechaInicio"] ?? p["Estreno"]);
    const renewalStatus = text(p["Renovacion"] ?? p["Renovación"]);
    const airingStatus = text(p["EstadoEmision"] ?? p["Estado Emision"] ?? p["Estado Emisión"]);
    const legacyStatus = text(p["Estado"]);
    const imdbText = text(p["IMDB"]);
    const imdbScore = Number.parseFloat(imdbText.replace(",", "."));

    return {
      id: page.id,
      slug: `${slugify(title)}-${page.id}`,
      kind: "series" as const,
      title,
      spanishTitle: text(p["TituloEspañol"] ?? p["Título Español"]) || undefined,
      synopsis: text(p["Sinopsis"] ?? p["Descripción"]) || "La ficha completa de esta serie se está preparando.",
      posterUrl: file(p["Poster"]),
      posterTone: posterTone(index),
      score: Number.isFinite(imdbScore) ? imdbScore : number(p["Puntuación"]),
      platform: text(p["CadenaPlataforma"] ?? p["Plataforma"]) || "Por confirmar",
      latamPlatform: text(p["Latam"]) || undefined,
      country: text(p["País"] ?? p["Pais"]) || "—",
      genres: multi(p["Géneros"] ?? p["Generos"]) .length
        ? multi(p["Géneros"] ?? p["Generos"])
        : [text(p["Género"] ?? p["Genero"])].filter(Boolean),
      season: text(p["Temporada"]) || undefined,
      totalEpisodes: number(p["Episodios"]),
      airedEpisodes: number(p["EpisodiosEmitidos"]),
      watchedEpisodes: number(p["EpisodiosVistos"]),
      premiereDate,
      finaleDate: date(p["FechaFin"]),
      status: mapStatus(renewalStatus || airingStatus || legacyStatus, premiereDate),
      renewalStatus: renewalStatus || undefined,
      airingStatus: airingStatus || undefined,
      imdbUrl: /^https?:/.test(imdbText) ? imdbText : undefined,
      featured: index === 0,
    };
}

function seriesSourceId() {
  return process.env.NOTION_SERIES_DATA_SOURCE_ID;
}

export async function getNotionSeriesCatalog(limit = 120): Promise<MediaItem[]> {
  const sourceId = seriesSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  }, limit);
  return pages.flatMap((page, index) => normalizeSeriesPage(page, index) ?? []);
}

export async function getNotionSeriesPremieres(start: string, end: string): Promise<MediaItem[]> {
  const sourceId = seriesSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { and: [
      { property: "FechaInicio", date: { on_or_after: start } },
      { property: "FechaInicio", date: { on_or_before: end } },
    ] },
    sorts: [{ property: "FechaInicio", direction: "ascending" }],
  });
  return pages.flatMap((page, index) => normalizeSeriesPage(page, index) ?? []).map(compactSeriesEvent);
}

export async function getNotionSeriesFinales(start: string, end: string): Promise<MediaItem[]> {
  const sourceId = seriesSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { and: [
      { property: "FechaFin", date: { on_or_after: start } },
      { property: "FechaFin", date: { on_or_before: end } },
    ] },
    sorts: [{ property: "FechaFin", direction: "ascending" }],
  });
  return pages.flatMap((page, index) => normalizeSeriesPage(page, index) ?? []).map(compactSeriesEvent);
}

function compactSeriesEvent(item: MediaItem): MediaItem {
  return { ...item, synopsis: "", posterUrl: undefined, genres: [] };
}

export async function getNotionTopSeries(): Promise<MediaItem[]> {
  const sourceId = seriesSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { and: [
      { property: "UltimaEmitida", checkbox: { equals: true } },
      { property: "IMDB", rich_text: { is_not_empty: true } },
      { property: "IMDB", rich_text: { does_not_equal: "?" } },
    ] },
    sorts: [{ property: "IMDB", direction: "descending" }],
  }, 150);
  const ranked = pages
    .flatMap((page, index) => normalizeSeriesPage(page, index) ?? [])
    .filter((series) => series.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const uniqueByTitle = new Map<string, MediaItem>();
  for (const series of ranked) {
    const titleKey = slugify(series.title);
    if (!uniqueByTitle.has(titleKey)) uniqueByTitle.set(titleKey, series);
  }

  return [...uniqueByTitle.values()].slice(0, 50);
}

export async function getNotionSeriesById(pageId: string): Promise<MediaItem | undefined> {
  const page = await retrievePage(pageId);
  return page ? normalizeSeriesPage(page) : undefined;
}

export async function getNotionEpisodesRange(start: string, end: string): Promise<EpisodeEvent[]> {
  const sourceId = process.env.NOTION_EPISODES_DATA_SOURCE_ID;
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { and: [
      { property: "Fecha", date: { on_or_after: start } },
      { property: "Fecha", date: { on_or_before: end } },
    ] },
    sorts: [{ property: "Fecha", direction: "ascending" }],
  }, 100);

  return pages.flatMap((page, index) => {
    const p = page.properties ?? {};
    const title = text(p["Serie"] ?? p["Título"]);
    const episodeDate = date(p["Fecha"]);
    if (!title || !episodeDate) return [];
    return [{
      id: page.id,
      seriesSlug: slugify(title),
      href: "/series",
      title,
      episode: [text(p["Temporada"]), text(p["Episodio"])].filter(Boolean).join(" · ") || "Nuevo episodio",
      date: episodeDate,
      platform: multi(p["CadenaPlataforma"])[0] ?? text(p["CadenaPlataforma"]) ?? "Por confirmar",
      posterUrl: file(p["Poster"]),
      posterTone: posterTone(index),
      tags: multi(p["Tags"]),
    }];
  });
}

function normalizeMoviePage(page: NotionPage, index = 0): MediaItem | undefined {
    const p = page.properties ?? {};
    const title = text(p["Título"] ?? p["Titulo"] ?? p["Name"]);
    if (!title) return undefined;
    const releaseDate = date(p["FechaEstreno"] ?? p["Estreno"] ?? p["Fecha"]);
    const yearLabel = multi(p["AnoEstreno"] ?? p["AñoEstreno"])[0] ?? "";
    const releaseYear = Number.parseInt(yearLabel.match(/\d{4}/)?.[0] ?? releaseDate?.slice(0, 4) ?? "", 10);
    const releaseTags = multi(p["Etiquetas"] ?? p["Tags"]);
    const releaseType = text(p["TipoEstreno"] ?? p["Tipo de estreno"]);
    const streaming = text(p["Streaming"]);
    const imdbText = text(p["IMDb"] ?? p["IMDB"]);
    const imdbScore = Number.parseFloat(imdbText.replace(",", "."));
    const genres = multi(p["Genero"] ?? p["Género"] ?? p["Géneros"] ?? p["Generos"]);
    const status = releaseDate && new Date(releaseDate) > new Date()
      ? "Próximamente"
      : releaseTags.some((tag) => /adici/i.test(tag)) ? "En catálogo" : "Estreno";
    return {
      id: page.id,
      slug: `${slugify(`${title}-${Number.isFinite(releaseYear) ? releaseYear : "pelicula"}`)}-${page.id}`,
      kind: "movie" as const,
      title,
      spanishTitle: text(p["TituloEspanol"] ?? p["TítuloEspañol"] ?? p["Título Español"]) || undefined,
      synopsis: text(p["Sinopsis"] ?? p["Descripción"]) || "La ficha completa de esta película se está preparando.",
      posterUrl: file(p["Poster"]),
      posterTone: posterTone(index + 2),
      score: Number.isFinite(imdbScore) ? imdbScore : number(p["Puntuacion"] ?? p["Puntuación"]),
      platform: streaming || releaseType || "Por confirmar",
      streaming: streaming || undefined,
      country: text(p["País"] ?? p["Pais"]) || "—",
      genres,
      releaseDate,
      releaseYear: Number.isFinite(releaseYear) ? releaseYear : undefined,
      releaseType: releaseType || undefined,
      releaseTags,
      director: text(p["Director"]) || undefined,
      cast: multi(p["Actores"] ?? p["Elenco"]),
      watched: checked(p["Visto"]),
      watchedDate: date(p["FechaVisto"]),
      interested: checked(p["Interes"] ?? p["Interés"]),
      runtime: number(p["Duración"] ?? p["Duracion"]),
      status,
    };
}

function movieSourceId() {
  return process.env.NOTION_MOVIES_DATA_SOURCE_ID;
}

async function retrievePage(pageId: string) {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return undefined;
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Notion-Version": NOTION_VERSION },
  });
  if (!response.ok) throw new Error(`Notion respondió ${response.status}`);
  return response.json() as Promise<NotionPage>;
}

export async function getNotionUpcomingMovies(start: string, limit = 24): Promise<MediaItem[]> {
  const sourceId = movieSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { property: "Estreno", date: { on_or_after: start } },
    sorts: [{ property: "Estreno", direction: "ascending" }],
  }, limit);
  return pages.flatMap((page, index) => normalizeMoviePage(page, index) ?? []);
}

export async function getNotionMovieCalendar(start: string, end: string): Promise<MediaItem[]> {
  const sourceId = movieSourceId();
  if (!sourceId) return [];
  const pages = await queryDataSource(sourceId, {
    filter: { and: [
      { property: "Estreno", date: { on_or_after: start } },
      { property: "Estreno", date: { on_or_before: end } },
    ] },
    sorts: [{ property: "Estreno", direction: "ascending" }],
  });
  return pages.flatMap((page, index) => normalizeMoviePage(page, index) ?? []).map((movie) => ({
    ...movie,
    synopsis: "",
    posterUrl: undefined,
    director: undefined,
    cast: undefined,
    genres: [],
  }));
}

export async function getNotionTopMovies(year?: number): Promise<MediaItem[]> {
  const sourceId = movieSourceId();
  if (!sourceId) return [];
  const conditions: Array<Record<string, unknown>> = [
    { property: "Etiquetas", multi_select: { contains: "Estreno" } },
    { property: "IMDb", rich_text: { is_not_empty: true } },
    { property: "IMDb", rich_text: { does_not_equal: "?" } },
  ];
  if (year) conditions.push({ property: "AnoEstreno", multi_select: { contains: `Año ${year}` } });
  const pages = await queryDataSource(sourceId, {
    filter: { and: conditions },
    sorts: [{ property: "IMDb", direction: "descending" }],
  }, 150);
  const ranked = pages
    .flatMap((page, index) => normalizeMoviePage(page, index) ?? [])
    .filter((movie) => movie.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const uniqueMovies = new Map<string, MediaItem>();
  for (const movie of ranked) {
    const movieKey = `${slugify(movie.title)}|${movie.releaseYear ?? ""}`;
    if (!uniqueMovies.has(movieKey)) uniqueMovies.set(movieKey, movie);
  }

  return [...uniqueMovies.values()].slice(0, 50);
}

export async function getNotionMovieById(pageId: string): Promise<MediaItem | undefined> {
  const page = await retrievePage(pageId);
  return page ? normalizeMoviePage(page) : undefined;
}
