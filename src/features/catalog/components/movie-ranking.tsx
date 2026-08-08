"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MediaCard } from "@/features/catalog/components/media-card";
import type { MediaItem } from "@/shared/lib/types";

export function MovieRanking({ movies, selectedYear, years }: { movies: MediaItem[]; selectedYear?: number; years: number[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const ranking = [...movies].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 50);

  return <>
    <div className="ranking-filter">
      <div><span>Año de lanzamiento</span><strong>{selectedYear ?? "Todos los años"}</strong></div>
      <label>
        <span className="sr-only">Filtrar por año de lanzamiento</span>
        <select disabled={pending} value={selectedYear ?? "all"} onChange={(event) => startTransition(() => router.push(event.target.value === "all" ? "/peliculas/top-50" : `/peliculas/top-50?year=${event.target.value}`))}>
          <option value="all">Todos los años</option>
          {years.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </label>
      <small>{ranking.length} películas en el ranking</small>
    </div>
    {ranking.length ? <div className="media-grid catalog-grid">{ranking.map((movie, index) => <MediaCard item={movie} rank={index + 1} key={movie.id} />)}</div> : <div className="empty-ranking">No hay películas puntuadas para este año.</div>}
  </>;
}
