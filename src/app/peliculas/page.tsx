import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Film, Trophy } from "lucide-react";
import { MediaCard } from "@/features/catalog/components/media-card";
import { MovieNav } from "@/features/catalog/components/movie-nav";
import { getMovieLandingHub, sortByDate, sortByScore } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";
import { SectionHeading } from "@/shared/components/section-heading";

export const metadata: Metadata = { title: "Películas" };

export default async function MoviesPage() {
  const hub = await getMovieLandingHub();
  const today = new Date().toISOString().slice(0, 10);
  const dated = sortByDate(hub.movies, "releaseDate");
  const upcoming = dated.filter((movie) => (movie.releaseDate ?? "") >= today).slice(0, 10);
  const selection = upcoming.length ? upcoming : dated.slice(-10).reverse();
  const top = sortByScore(hub.movies)[0];

  return <>
    <PageHero eyebrow="Universo de películas" title="Del estreno a tu catálogo." copy="Fechas de cine y streaming, adiciones de plataformas, rankings IMDb y las personas detrás de cada película." />
    <MovieNav />
    <DemoNotice visible={hub.isDemo} />

    <section className="section shell movie-entry-grid">
      <Link className="movie-entry-card calendar-entry" href="/peliculas/calendario">
        <span><CalendarDays size={21} /> Calendario mensual</span>
        <h2>Todo lo que llega, en la fecha correcta.</h2>
        <p>Distingue estrenos, adiciones al catálogo, lanzamientos en cines y llegadas directas a streaming.</p>
        <strong>Explorar calendario <ArrowRight size={17} /></strong>
      </Link>
      <Link className="movie-entry-card ranking-entry" href="/peliculas/top-50">
        <span><Trophy size={21} /> Top 50 IMDb</span>
        <h2>{top ? `${top.title} lidera la conversación.` : "Las mejores, año por año."}</h2>
        <p>Ordena por puntuación IMDb y filtra el ranking por el año original de lanzamiento.</p>
        <strong>Ver el ranking <ArrowRight size={17} /></strong>
      </Link>
    </section>

    <section className="section section-tinted"><div className="shell">
      <SectionHeading eyebrow="Próximos movimientos" title="En cines y plataformas." copy="Una selección cronológica del radar de estrenos y adiciones." href="/peliculas/calendario" linkLabel="Abrir calendario" />
      <div className="media-grid catalog-grid movie-grid">{selection.map((item) => <MediaCard item={item} key={item.id} />)}</div>
    </div></section>

    <section className="shell movie-data-note"><Film size={22} /><div><strong>{hub.movies.length} películas normalizadas</strong><span>Cada ficha puede reunir varios eventos de distribución sin duplicar la obra.</span></div></section>
  </>;
}
