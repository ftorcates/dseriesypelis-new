import type { Metadata } from "next";
import { MovieNav } from "@/features/catalog/components/movie-nav";
import { MovieCalendar, type MovieCalendarEvent } from "@/features/calendar/components/movie-calendar";
import { getMovieCalendarHub } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Calendario de películas" };

export default async function MovieCalendarPage() {
  const hub = await getMovieCalendarHub();
  const events: MovieCalendarEvent[] = hub.events
    .filter((movie) => movie.releaseDate)
    .map((movie) => {
      const addition = movie.releaseTags?.some((tag) => /adici/i.test(tag)) ?? false;
      const premiere = movie.releaseTags?.some((tag) => /estreno/i.test(tag)) ?? false;
      return {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        date: movie.releaseDate!,
        meta: [addition ? movie.streaming : movie.releaseType, addition ? "Adición" : movie.releaseTags?.[0]].filter(Boolean).join(" · "),
        tone: movie.posterTone,
        href: `/peliculas/${movie.slug}`,
        category: addition ? "Adición" : premiere ? "Estreno" : "Otro",
        releaseType: movie.releaseType ?? "",
      };
    });

  return <>
    <PageHero eyebrow="Calendario mensual" title="Cada película tiene su momento." copy="Filtra los lanzamientos por estreno, adición al catálogo, cines o streaming sin perder el contexto de cada fecha." />
    <MovieNav />
    <DemoNotice visible={hub.isDemo} />
    <section className="section shell"><MovieCalendar events={events} /></section>
  </>;
}
