import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, PlayCircle, Radio, Star } from "lucide-react";
import { MediaCard } from "@/features/catalog/components/media-card";
import { Poster } from "@/features/catalog/components/poster";
import { getSeriesCatalogHub, getSeriesDetail } from "@/server/notion/content";

interface DetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getSeriesDetail(slug);
  return { title: item?.title ?? "Serie" };
}

function formatDate(value?: string) {
  if (!value) return "Por confirmar";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default async function SeriesDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  const item = await getSeriesDetail(slug);
  if (!item) notFound();
  const hub = await getSeriesCatalogHub();
  const related = hub.series.filter((series) => series.slug !== slug && (series.genres.some((genre) => item.genres.includes(genre)) || series.platform === item.platform)).slice(0, 4);
  const progress = item.totalEpisodes ? Math.min(100, Math.round(((item.airedEpisodes ?? 0) / item.totalEpisodes) * 100)) : 0;

  return (
    <>
      <section className={`detail-hero poster-${item.posterTone}`}>
        <div className="detail-backdrop" />
        <div className="shell detail-grid">
          <Link className="back-link" href="/series"><ArrowLeft size={17} /> Volver a series</Link>
          <div className="detail-poster"><Poster title={item.title} url={item.posterUrl} tone={item.posterTone} /></div>
          <div className="detail-copy">
            <div className="detail-labels"><span>{item.status}</span><span>{item.platform}</span>{item.season && <span>{item.season}</span>}</div>
            <h1>{item.title}</h1>
            {item.spanishTitle && <p className="original-title">{item.spanishTitle}</p>}
            <div className="detail-score"><Star size={19} fill="currentColor" /><strong>{item.score?.toFixed(1) ?? "—"}</strong><span>IMDb</span></div>
            <p className="detail-synopsis">{item.synopsis}</p>
            <div className="genre-row">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <div className="detail-actions"><Link className="button button-primary" href="/episodios"><CalendarDays size={17} /> Ver calendario</Link>{item.imdbUrl && <a className="button button-ghost" href={item.imdbUrl} target="_blank" rel="noreferrer">IMDb <ExternalLink size={16} /></a>}</div>
          </div>
        </div>
      </section>

      <section className="section shell detail-content">
        <div className="detail-main">
          <span className="eyebrow">Estado de emisión</span>
          <h2>La temporada, de un vistazo.</h2>
          <div className="progress-card">
            <div className="progress-head"><div><PlayCircle size={20} /><span>Episodios emitidos</span></div><strong>{item.airedEpisodes ?? 0} <small>/ {item.totalEpisodes ?? "—"}</small></strong></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="progress-foot"><span>{progress}% emitido</span><span>{Math.max(0, (item.totalEpisodes ?? 0) - (item.airedEpisodes ?? 0))} por emitir</span></div>
          </div>
          <div className="info-grid">
            <div><Radio size={19} /><span>Cadena / plataforma</span><strong>{item.platform}</strong>{item.latamPlatform && <small>Latam: {item.latamPlatform}</small>}</div>
            <div><CalendarDays size={19} /><span>Estreno de temporada</span><strong>{formatDate(item.premiereDate)}</strong></div>
            <div><CheckCircle2 size={19} /><span>Final previsto</span><strong>{formatDate(item.finaleDate)}</strong></div>
            <div><Star size={19} /><span>País de origen</span><strong>{item.country}</strong></div>
          </div>
        </div>
        <aside className="detail-aside">
          <span>MI PROGRESO</span>
          <strong>{item.watchedEpisodes ?? 0} de {item.totalEpisodes ?? "—"}</strong>
          <small>episodios vistos</small>
          <div className="progress-ring" style={{ "--progress": `${item.totalEpisodes ? Math.round(((item.watchedEpisodes ?? 0) / item.totalEpisodes) * 100) : 0}%` } as React.CSSProperties}><span>{item.totalEpisodes ? Math.round(((item.watchedEpisodes ?? 0) / item.totalEpisodes) * 100) : 0}%</span></div>
          <p>Este progreso refleja la información que mantienes en Notion.</p>
        </aside>
      </section>

      {related.length > 0 && <section className="section section-tinted"><div className="shell"><div className="section-heading"><div><span className="eyebrow">También podrían gustarte</span><h2>Más historias para seguir.</h2></div></div><div className="media-grid">{related.map((series) => <MediaCard item={series} key={series.id} />)}</div></div></section>}
    </>
  );
}
