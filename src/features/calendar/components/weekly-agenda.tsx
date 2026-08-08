import Link from "next/link";
import type { EpisodeEvent } from "@/shared/lib/types";

const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function startOfWeek(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  value.setHours(0, 0, 0, 0);
  return value;
}

export function WeeklyAgenda({ events }: { events: EpisodeEvent[] }) {
  const today = new Date();
  const start = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  return (
    <div className="weekly-agenda">
      <div className="week-range">Semana del {start.getDate()} de {monthNames[start.getMonth()]}</div>
      <div className="week-grid">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const daily = events.filter((event) => event.date === key);
          const isToday = key === today.toISOString().slice(0, 10);
          return (
            <div className={`day-column ${isToday ? "is-today" : ""}`} key={key}>
              <div className="day-header"><span>{dayNames[day.getDay()]}</span><strong>{day.getDate()}</strong>{isToday && <small>HOY</small>}</div>
              <div className="day-events">
                {daily.length ? daily.map((event) => (
                  <Link className={`episode-event poster-${event.posterTone}`} href={event.href ?? `/series/${event.seriesSlug}`} key={event.id}>
                    <span className="event-platform">{event.platform}</span>
                    <strong>{event.title}</strong>
                    <small>{event.episode}</small>
                    {event.tags?.[0] && <em>{event.tags[0]}</em>}
                  </Link>
                )) : <span className="empty-day">Sin emisiones</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
