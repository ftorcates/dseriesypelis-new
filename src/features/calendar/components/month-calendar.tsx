"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export interface CalendarMediaEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  meta: string;
  tone: string;
  href?: string;
}

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthCalendar({ events, initialDate }: { events: CalendarMediaEvent[]; initialDate?: string }) {
  const initial = initialDate ? new Date(`${initialDate.slice(0, 7)}-02T12:00:00`) : new Date();
  const [cursor, setCursor] = useState(initial);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(cursor);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [year, month]);

  const move = (amount: number) => setCursor(new Date(year, month + amount, 1));

  return (
    <div className="month-calendar">
      <div className="calendar-toolbar">
        <h2>{monthLabel}</h2>
        <div><button onClick={() => move(-1)} aria-label="Mes anterior"><ChevronLeft size={19} /></button><button onClick={() => setCursor(new Date())}>Hoy</button><button onClick={() => move(1)} aria-label="Mes siguiente"><ChevronRight size={19} /></button></div>
      </div>
      <div className="month-grid month-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="month-grid month-days">
        {cells.map((day, index) => {
          if (!day) return <div className="month-cell is-empty" key={`empty-${index}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
          const daily = events.filter((event) => event.date === key);
          const isToday = key === new Date().toISOString().slice(0, 10);
          return (
            <div className={`month-cell ${isToday ? "is-today" : ""}`} key={key}>
              <span className="month-number">{day.getDate()}</span>
              {daily.slice(0, 3).map((event) => <Link className={`calendar-chip poster-${event.tone}`} href={event.href ?? `/series/${event.slug}`} key={event.id}><strong>{event.title}</strong><small>{event.meta}</small></Link>)}
              {daily.length > 3 && <span className="more-events">+{daily.length - 3} más</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
