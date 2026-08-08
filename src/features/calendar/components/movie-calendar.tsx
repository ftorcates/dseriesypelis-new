"use client";

import { useMemo, useState } from "react";
import { MonthCalendar, type CalendarMediaEvent } from "@/features/calendar/components/month-calendar";

export interface MovieCalendarEvent extends CalendarMediaEvent {
  category: "Estreno" | "Adición" | "Otro";
  releaseType: string;
}

const filters = ["Todo", "Estrenos", "Adiciones", "Cines", "Streaming"] as const;

export function MovieCalendar({ events }: { events: MovieCalendarEvent[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todo");
  const filtered = useMemo(() => events.filter((event) => {
    if (filter === "Estrenos") return event.category === "Estreno";
    if (filter === "Adiciones") return event.category === "Adición";
    if (filter === "Cines") return event.releaseType === "Cines";
    if (filter === "Streaming") return event.releaseType === "Streaming";
    return true;
  }), [events, filter]);

  return <div>
    <div className="filter-bar" aria-label="Filtrar calendario">
      <span>Mostrar</span>
      <div>{filters.map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <small>{filtered.length} eventos</small>
    </div>
    <MonthCalendar events={filtered} />
  </div>;
}
