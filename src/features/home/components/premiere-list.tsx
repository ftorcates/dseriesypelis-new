"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { animate, stagger } from "animejs";
import { useEffect, useRef, useState } from "react";
import { Poster } from "@/features/catalog/components/poster";
import type { MediaItem } from "@/shared/lib/types";

function formatPremiere(value?: string) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export function PremiereList({ series, movies }: { series: MediaItem[]; movies: MediaItem[] }) {
  const [kind, setKind] = useState<"series" | "movies">(series.length ? "series" : "movies");
  const itemsRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const items = kind === "series" ? series : movies;
  const allHref = kind === "series" ? "/estrenos" : "/peliculas/calendario";

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const entries = itemsRef.current?.querySelectorAll(".premiere-item, .premiere-empty");
    if (!entries?.length) return;
    const animation = animate(entries, { opacity: [0, 1], y: [-12, 0], delay: stagger(65), duration: 480, ease: "outExpo" });
    return () => { animation.cancel(); };
  }, [kind]);

  return (
    <aside className="premiere-list">
      <div className="premiere-head">
        <span>Próximos estrenos</span>
        <div className="premiere-tabs" data-kind={kind} aria-label="Tipo de estreno">
          <button aria-pressed={kind === "series"} className={kind === "series" ? "active" : ""} onClick={() => setKind("series")}>Series</button>
          <button aria-pressed={kind === "movies"} className={kind === "movies" ? "active" : ""} onClick={() => setKind("movies")}>Películas</button>
        </div>
      </div>
      <div className="premiere-items" ref={itemsRef}>
        {items.slice(0, 3).map((item) => (
          <Link className="premiere-item" href={item.kind === "movie" ? `/peliculas/${item.slug}` : `/series/${item.slug}`} key={item.id}>
            <div><Poster title={item.title} url={item.posterUrl} tone={item.posterTone} /></div>
            <span><strong>{item.title}</strong><small>{formatPremiere(item.premiereDate ?? item.releaseDate)}</small><em>{item.platform}</em></span>
          </Link>
        ))}
        {!items.length && <p className="premiere-empty">No hay estrenos futuros registrados.</p>}
      </div>
      <Link className="premiere-all" href={allHref}>Ver todos los estrenos <ArrowRight size={16} /></Link>
    </aside>
  );
}
