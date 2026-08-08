import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clapperboard, Film, MapPin, MonitorPlay, Star, Tags, UserRound } from "lucide-react";
import { MediaCard } from "@/features/catalog/components/media-card";
import { Poster } from "@/features/catalog/components/poster";
import { getMovieDetail, getMovieLandingHub } from "@/server/notion/content";

interface DetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMovieDetail(slug);
  return { title: item?.title ?? "Película" };
}

function formatDate(value?: string) {
  if (!value) return "Por confirmar";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default async function MovieDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  const [item, hub] = await Promise.all([getMovieDetail(slug), getMovieLandingHub()]);
  if (!item) notFound();
  const related = hub.movies.filter((movie) => movie.slug !== slug && movie.genres.some((genre) => item.genres.includes(genre))).slice(0, 4);

  return <>
    <section className={`detail-hero movie-detail-hero poster-${item.posterTone}`}>
      <div className="detail-backdrop" />
      <div className="shell detail-grid">
        <Link className="back-link" href="/peliculas"><ArrowLeft size={17} /> Volver a películas</Link>
        <div className="detail-poster"><Poster title={item.title} url={item.posterUrl} tone={item.posterTone} /></div>
        <div className="detail-copy">
          <div className="detail-labels"><span>Película</span><span>{item.status}</span><span>{item.releaseType ?? item.platform}</span></div>
          <h1>{item.title}</h1>
          {item.spanishTitle && <p className="original-title">{item.spanishTitle}</p>}
          <div className="detail-score"><Star size={19} fill="currentColor" /><strong>{item.score?.toFixed(1) ?? "—"}</strong><span>IMDb</span></div>
          <p className="detail-synopsis">{item.synopsis}</p>
          <div className="genre-row">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          {!!item.releaseTags?.length && <div className="release-tags"><Tags size={14} />{item.releaseTags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          <div className="movie-facts">
            <span><CalendarDays size={16} /><i>Estreno</i><strong>{formatDate(item.releaseDate)}</strong></span>
            <span><MonitorPlay size={16} /><i>Distribución</i><strong>{item.streaming ?? item.releaseType ?? "Por confirmar"}</strong></span>
            <span><MapPin size={16} /><i>Origen</i><strong>{item.country}</strong></span>
          </div>
        </div>
      </div>
    </section>
    <section className="section shell movie-credits-grid">
      <div className="movie-credit-card featured-credit"><Clapperboard size={22} /><span>Dirección</span><strong>{item.director ?? "Por confirmar"}</strong></div>
      <div className="movie-cast-card"><div><UserRound size={20} /><span>Elenco principal</span></div>{item.cast?.length ? <ul>{item.cast.slice(0, 8).map((actor) => <li key={actor}>{actor}</li>)}</ul> : <p>El elenco aún no ha sido registrado en Notion.</p>}</div>
      <div className="movie-credit-card"><CalendarDays size={20} /><span>Año de lanzamiento</span><strong>{item.releaseYear ?? "—"}</strong></div>
      <div className="movie-credit-card"><CheckCircle2 size={20} /><span>Estado personal</span><strong>{item.watched ? `Vista${item.watchedDate ? ` · ${formatDate(item.watchedDate)}` : ""}` : item.interested ? "En seguimiento" : "Sin marcar"}</strong></div>
    </section>
    {related.length > 0 && <section className="section shell"><div className="section-heading"><div><span className="eyebrow"><Film size={14} /> En el radar</span><h2>Más películas por descubrir.</h2></div></div><div className="media-grid">{related.map((movie) => <MediaCard item={movie} key={movie.id} />)}</div></section>}
  </>;
}
