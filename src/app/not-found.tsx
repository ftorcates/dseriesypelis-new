import Link from "next/link";

export default function NotFound() {
  return <section className="not-found shell"><span>404</span><h1>Esta historia todavía no está en cartelera.</h1><p>La ficha que buscas no existe o aún no ha llegado desde Notion.</p><Link className="button button-primary" href="/series">Volver al catálogo</Link></section>;
}
