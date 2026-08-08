"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/series", label: "Series" },
  { href: "/episodios", label: "Episodios" },
  { href: "/estrenos", label: "Estrenos" },
  { href: "/finales", label: "Finales" },
  { href: "/top-50", label: "Top 50" },
  { href: "/peliculas", label: "Películas" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="D' Series y Pelis, inicio">
          <span className="brand-mark"><Clapperboard size={21} strokeWidth={1.8} /></span>
          <span><strong>D&apos;</strong> SERIES <i>Y</i> PELIS</span>
        </Link>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>;
          })}
        </nav>

        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Abrir navegación">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
