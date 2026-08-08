import Link from "next/link";
import { ArrowRight, CalendarDays, Film, Sparkles } from "lucide-react";
import { Hero } from "@/features/home/components/hero";
import { StatsStrip } from "@/features/home/components/stats-strip";
import { MediaCard } from "@/features/catalog/components/media-card";
import { Poster } from "@/features/catalog/components/poster";
import { DemoNotice } from "@/shared/components/demo-notice";
import { SectionHeading } from "@/shared/components/section-heading";
import { getContentHub, sortByDate, sortByScore } from "@/server/notion/content";

export default async function Home() {
  const hub = await getContentHub();
  const featured = hub.series.find((item) => item.featured) ?? hub.series[0];
  const premieres = sortByDate(hub.series, "premiereDate");
  const nextPremiere = premieres.find((item) => item.slug !== featured.slug);
  const ranking = sortByScore(hub.series).slice(0, 5);
  const episodes = [...hub.episodes].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  return (
    <>
      <Hero featured={featured} nextPremiere={nextPremiere} />
      <DemoNotice visible={hub.isDemo} />
      <StatsStrip series={hub.series.length} upcoming={premieres.length} episodes={hub.episodes.length} movies={hub.movies.length} />

      <section className="section shell">
        <SectionHeading eyebrow="Agenda semanal" title="Esta semana no te pierdas" copy="Los episodios que marcan el ritmo de los próximos días." href="/episodios" />
        <div className="episode-rail">
          {episodes.map((event) => (
            <Link href={event.href ?? `/series/${event.seriesSlug}`} className="episode-tile" key={event.id}>
              <div className="episode-date"><span>{new Intl.DateTimeFormat("es-CL", { weekday: "short" }).format(new Date(`${event.date}T12:00:00`))}</span><strong>{event.date.slice(-2)}</strong></div>
              <div className={`episode-art poster-${event.posterTone}`}><Poster title={event.title} url={event.posterUrl} tone={event.posterTone} /></div>
              <div><small>{event.platform}</small><h3>{event.title}</h3><p>{event.episode}</p></div>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="shell">
          <SectionHeading eyebrow="Selección editorial" title="Las mejor puntuadas" copy="Un ranking vivo, alimentado por tu catálogo y ordenado por IMDb." href="/top-50" linkLabel="Explorar el Top 50" />
          <div className="media-grid ranking-preview">
            {ranking.map((item, index) => <MediaCard item={item} rank={index + 1} key={item.id} />)}
          </div>
        </div>
      </section>

      <section className="section shell split-feature">
        <div className="movie-radar-copy">
          <span className="eyebrow"><Film size={15} /> El universo se expande</span>
          <h2>También hay una gran película esperando.</h2>
          <p>El mismo criterio editorial, ahora preparado para estrenos de cine y streaming. Esta sección crecerá junto con tu catálogo de Notion.</p>
          <Link className="button button-primary" href="/peliculas">Entrar al radar de películas <ArrowRight size={17} /></Link>
          <div className="movie-mini-stats"><span><strong>{hub.movies.length}</strong> en seguimiento</span><span><strong>{hub.movies.filter((movie) => movie.score).length}</strong> con puntuación</span></div>
        </div>
        <div className="movie-fan">
          {hub.movies.slice(0, 3).map((movie, index) => <div className={`movie-fan-card fan-${index + 1}`} key={movie.id}><Poster title={movie.title} url={movie.posterUrl} tone={movie.posterTone} /></div>)}
          <div className="fan-badge"><Sparkles size={16} /><span>Próximamente</span></div>
        </div>
      </section>

      <section className="shell editorial-banner">
        <div><CalendarDays size={24} /><span>TODO TU CALENDARIO, UNA SOLA MIRADA</span></div>
        <Link href="/estrenos">Ver próximos estrenos <ArrowRight size={18} /></Link>
      </section>
    </>
  );
}
