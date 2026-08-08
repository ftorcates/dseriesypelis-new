import type { Metadata } from "next";
import { MediaCard } from "@/features/catalog/components/media-card";
import { getSeriesCatalogHub } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Series" };

export default async function SeriesPage() {
  const hub = await getSeriesCatalogHub();
  return <>
    <PageHero eyebrow="Catálogo de series" title="Todas tus historias, ordenadas." copy="Explora el catálogo completo, desde las que siguen en emisión hasta las que ya dejaron su huella." />
    <DemoNotice visible={hub.isDemo} />
    <section className="section shell"><div className="catalog-toolbar"><strong>{hub.series.length} series</strong><span>Orden editorial · Todas las plataformas</span></div><div className="media-grid catalog-grid">{hub.series.map((item) => <MediaCard item={item} key={item.id} />)}</div></section>
  </>;
}
