"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { MediaItem } from "@/shared/lib/types";
import { Poster } from "@/features/catalog/components/poster";

export function Hero({ featured, nextPremiere }: { featured: MediaItem; nextPremiere?: MediaItem }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !root.current) return;
    const context = gsap.context(() => {
      gsap.from(".hero-copy > *", { y: 34, opacity: 0, duration: 0.9, stagger: 0.09, ease: "power3.out" });
      gsap.from(".hero-stage", { y: 45, rotateY: -8, opacity: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".float-card", { y: -10, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="hero-aurora hero-aurora-one" />
      <div className="hero-aurora hero-aurora-two" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><i className="live-dot" /> Siempre es tiempo de series</span>
          <h1>Todo lo que quieres ver, <em>justo a tiempo.</em></h1>
          <p>Estrenos, episodios y finales en un solo lugar. Tu próxima obsesión empieza aquí.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/episodios"><CalendarDays size={18} /> Ver esta semana</Link>
            <Link className="button button-ghost" href={`/series/${featured.slug}`}><Play size={17} fill="currentColor" /> Explorar serie</Link>
          </div>
          <div className="hero-featured-meta">
            <span>EN CARTELERA</span>
            <strong>{featured.title}</strong>
            <small>{featured.season} · {featured.platform} · IMDb {featured.score?.toFixed(1) ?? "—"}</small>
          </div>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <div className="stage-glow" />
          <div className="stage-poster stage-poster-back"><Poster title="The Bear" tone="crimson" /></div>
          <div className="stage-poster stage-poster-main"><Poster title={featured.title} url={featured.posterUrl} tone={featured.posterTone} /></div>
          <div className="float-card float-score"><span>IMDb</span><strong>{featured.score?.toFixed(1) ?? "—"}</strong><small>Favorita del público</small></div>
          {nextPremiere && <div className="float-card float-premiere"><span>PRÓXIMO ESTRENO</span><strong>{nextPremiere.title}</strong><small>{nextPremiere.premiereDate ?? nextPremiere.releaseDate}</small></div>}
          <div className="stage-caption"><span>Ahora destacado</span><strong>{featured.title}</strong></div>
        </div>
      </div>
      <div className="hero-ticker" aria-label="Categorías destacadas">
        <div><span>ESTRENOS</span><i>✦</i><span>EPISODIOS</span><i>✦</i><span>FINALES</span><i>✦</i><span>TOP IMDb</span><i>✦</i><span>PELÍCULAS</span><i>✦</i><span>ESTRENOS</span><i>✦</i></div>
      </div>
      <Link className="hero-corner-link" href="/estrenos">Próximamente <ArrowRight size={16} /></Link>
    </section>
  );
}
