"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Hoy" },
  { href: "/series", label: "Series" },
  { href: "/peliculas", label: "Películas" },
  { href: "/episodios", label: "Calendarios" },
  { href: "/top-50", label: "Rankings" },
];

function editionDate() {
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date())
    .toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      frame = 0;
      setCompact(window.scrollY > 72);
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    updateHeader();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`site-header ${compact ? "is-compact" : ""}`}>
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="D' Series y Pelis, inicio">
          <strong>D&apos;</strong>
          <span>SERIES<br /><i>Y</i> PELIS<small>LA GUÍA CULTURAL</small></span>
        </Link>

        <div className="edition-stamp"><span>EDICIÓN DIGITAL</span><strong>{editionDate()}</strong></div>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>;
          })}
        </nav>

        <button className="search-button" aria-label="Buscar en el catálogo"><MagnifyingGlass size={23} /></button>
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Abrir navegación">
          {open ? <X size={25} /> : <List size={25} />}
        </button>
      </div>
    </header>
  );
}
