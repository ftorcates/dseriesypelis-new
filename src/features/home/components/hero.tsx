import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "@/features/catalog/components/poster";
import { PremiereList } from "@/features/home/components/premiere-list";
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

export function Hero({ featured, episodes, seriesPremieres, moviePremieres }: { featured: MediaItem; episodes: EpisodeEvent[]; seriesPremieres: MediaItem[]; moviePremieres: MediaItem[] }) {
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
        <span className="motion-hero-eyebrow">AGENDA · SERIES Y PELÍCULAS</span>
        <div className="hero-title-mask"><h1 className="motion-hero-title">¿Qué veo esta semana?</h1></div>
        <span className="hero-rule" aria-hidden="true" />
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
        <Link className="feature-image motion-feature-image" href={`/series/${featured.slug}`}><Poster title={featured.title} url={featured.posterUrl} tone={featured.posterTone} /></Link>
        <article className="daily-pick">
          <span className="eyebrow motion-pick-detail">Recomendación del día</span>
          <h2 className="motion-pick-title" aria-label={featured.title}>
            {featured.title.split(/\s+/).map((word, index) => <span className="motion-pick-word" aria-hidden="true" key={`${word}-${index}`}>{word}</span>)}
          </h2>
          <p className="pick-meta motion-pick-detail">{featured.season ?? featured.status} · {featured.platform}</p>
          <div className="pick-score motion-pick-detail"><b>IMDb</b><strong><span data-motion-score>{featured.score?.toFixed(1) ?? "—"}</span><small>/10</small></strong></div>
          <p className="motion-pick-detail">{recommendation}</p>
          <Link className="button button-primary motion-pick-detail" href={`/series/${featured.slug}`}>Ver ficha <ArrowRight size={18} /></Link>
        </article>
        <PremiereList series={seriesPremieres} movies={moviePremieres} />
      </div>
    </section>
  );
}
