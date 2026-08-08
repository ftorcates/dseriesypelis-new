"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Film, Trophy } from "lucide-react";

const items = [
  { href: "/peliculas", label: "Películas", icon: Film },
  { href: "/peliculas/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/peliculas/top-50", label: "Top 50 IMDb", icon: Trophy },
];

export function MovieNav() {
  const pathname = usePathname();
  return <nav className="movie-subnav shell" aria-label="Secciones de películas">{items.map(({ href, label, icon: Icon }) => {
    const active = href === "/peliculas" ? pathname === href : pathname.startsWith(href);
    return <Link className={active ? "active" : ""} href={href} key={href}><Icon size={16} />{label}</Link>;
  })}</nav>;
}
