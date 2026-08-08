import { CalendarCheck, Clapperboard, Film, Star } from "lucide-react";

export function StatsStrip({ series, upcoming, episodes, movies }: { series: number; upcoming: number; episodes: number; movies: number }) {
  const stats = [
    { icon: Clapperboard, value: series, label: "series en el radar" },
    { icon: CalendarCheck, value: upcoming, label: "próximos estrenos" },
    { icon: Star, value: episodes, label: "episodios agendados" },
    { icon: Film, value: movies, label: "películas seguidas" },
  ];
  return (
    <div className="stats-strip shell">
      {stats.map(({ icon: Icon, value, label }) => <div className="stat" key={label}><Icon size={20} /><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
    </div>
  );
}
