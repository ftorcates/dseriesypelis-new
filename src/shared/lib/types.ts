export type MediaKind = "series" | "movie";

export type MediaStatus =
  | "En emisión"
  | "Renovada"
  | "Finalizada"
  | "Miniserie"
  | "Estreno"
  | "En catálogo"
  | "Próximamente";

export interface MediaItem {
  id: string;
  slug: string;
  kind: MediaKind;
  title: string;
  spanishTitle?: string;
  synopsis: string;
  posterUrl?: string;
  posterTone: string;
  score?: number;
  platform: string;
  latamPlatform?: string;
  country: string;
  genres: string[];
  season?: string;
  totalEpisodes?: number;
  airedEpisodes?: number;
  watchedEpisodes?: number;
  premiereDate?: string;
  finaleDate?: string;
  releaseDate?: string;
  releaseYear?: number;
  releaseType?: string;
  releaseTags?: string[];
  streaming?: string;
  director?: string;
  cast?: string[];
  watched?: boolean;
  watchedDate?: string;
  interested?: boolean;
  runtime?: number;
  status: MediaStatus;
  imdbUrl?: string;
  featured?: boolean;
}

export interface EpisodeEvent {
  id: string;
  seriesSlug: string;
  href?: string;
  title: string;
  episode: string;
  date: string;
  platform: string;
  posterUrl?: string;
  posterTone: string;
  tags?: string[];
}
