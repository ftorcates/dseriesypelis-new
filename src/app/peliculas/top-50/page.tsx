import type { Metadata } from "next";
import { MovieNav } from "@/features/catalog/components/movie-nav";
import { MovieRanking } from "@/features/catalog/components/movie-ranking";
import { getMovieRankingHub } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Top 50 de películas" };

export default async function MovieTopPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const rawYear = (await searchParams).year;
  const parsedYear = rawYear ? Number(rawYear) : undefined;
  const year = parsedYear && parsedYear >= 1980 && parsedYear <= new Date().getFullYear() + 3 ? parsedYear : undefined;
  const hub = await getMovieRankingHub(year);
  const years = Array.from({ length: new Date().getFullYear() + 3 - 1980 + 1 }, (_, index) => new Date().getFullYear() + 3 - index);
  return <>
    <PageHero eyebrow="Ranking de películas" title="Top 50 IMDb, año por año." copy="Las películas mejor puntuadas de tu base, con un filtro por su año original de lanzamiento —no por la fecha en que llegan a una plataforma." />
    <MovieNav />
    <DemoNotice visible={hub.isDemo} />
    <section className="section shell"><MovieRanking movies={hub.movies} selectedYear={year} years={years} /></section>
  </>;
}
