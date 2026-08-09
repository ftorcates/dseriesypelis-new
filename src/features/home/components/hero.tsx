import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "@/features/catalog/components/poster";
import type { EpisodeEvent, MediaItem } from "@/shared/lib/types";

const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(12, 0, 0, 0);
  return date;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatPremiere(value?: string) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}

export function Hero({ featured, episodes, premieres }: { featured: MediaItem; episodes: EpisodeEvent[]; premieres: MediaItem[] }) {
  const today = new Date();
  const start = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const recommendation = /ficha completa/i.test(featured.synopsis)
    ? `${featured.title} continúa ${featured.season ? `con ${featured.season.toLowerCase()}` : "en nuestra selección"} a través de ${featured.platform}. Una de las series mejor valoradas de tu catálogo.`
    : featured.synopsis;

  return (
    <section className="editorial-hero shell">
      <div className="hero-title-row">
        <span>AGENDA · SERIES Y PELÍCULAS</span>
        <h1>¿Qué veo esta semana?</h1>
      </div>

      <div className="week-ledger">
        {days.map((day) => {
          const key = dateKey(day);
          const daily = episodes.filter((event) => event.date === key);
          const isToday = key === dateKey(today);
          return (
            <article className={isToday ? "ledger-day is-today" : "ledger-day"} key={key}>
              <div className="ledger-date"><span>{dayNames[day.getDay()]}</span>{isToday && <em>HOY</em>}<strong>{String(day.getDate()).padStart(2, "0")}</strong><small>{monthNames[day.getMonth()]}</small></div>
              <div className="ledger-events">
                {daily.length ? daily.slice(0, 2).map((event) => (
                  <Link href={event.href ?? `/series/${event.seriesSlug}`} key={event.id}>
                    <strong>{event.title}</strong><span>{event.episode}</span><small>{event.platform}</small>
                  </Link>
                )) : <p>Sin estrenos<br />registrados</p>}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hero-feature-grid">
        <Link className="feature-image" href={`/series/${featured.slug}`}><Poster title={featured.title} url={featured.posterUrl} tone={featured.posterTone} /></Link>
        <article className="daily-pick">
          <span className="eyebrow">Recomendación del día</span>
          <h2>{featured.title}</h2>
          <p className="pick-meta">{featured.season ?? featured.status} · {featured.platform}</p>
          <div className="pick-score"><b>IMDb</b><strong>{featured.score?.toFixed(1) ?? "—"}<small>/10</small></strong></div>
          <p>{recommendation}</p>
          <Link className="button button-primary" href={`/series/${featured.slug}`}>Ver ficha <ArrowRight size={18} /></Link>
        </article>
        <aside className="premiere-list">
          <div className="premiere-head"><span>Próximos estrenos</span><Link href="/peliculas/calendario">PELÍCULAS</Link></div>
          {premieres.slice(0, 3).map((item) => (
            <Link href={item.kind === "movie" ? `/peliculas/${item.slug}` : `/series/${item.slug}`} key={item.id}>
              <div><Poster title={item.title} url={item.posterUrl} tone={item.posterTone} /></div>
              <span><strong>{item.title}</strong><small>{formatPremiere(item.premiereDate ?? item.releaseDate)}</small><em>{item.platform}</em></span>
            </Link>
          ))}
          <Link className="premiere-all" href="/estrenos">Ver todos los estrenos <ArrowRight size={16} /></Link>
        </aside>
      </div>
    </section>
  );
}
