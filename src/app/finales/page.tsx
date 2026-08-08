import type { Metadata } from "next";
import { MonthCalendar } from "@/features/calendar/components/month-calendar";
import { getSeriesFinaleHub, sortByDate } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Finales" };

export default async function FinalesPage() {
  const hub = await getSeriesFinaleHub();
  const finales = sortByDate(hub.series, "finaleDate");
  const events = finales.map((item) => ({ id: item.id, slug: item.slug, title: item.title, date: item.finaleDate!, meta: `${item.season ?? "Temporada"} · Final`, tone: item.posterTone }));
  return <><PageHero eyebrow="Finales de temporada" title="Toda historia merece un gran cierre." copy="Las fechas que no admiten spoilers: finales de temporada, de serie y miniseries." /><DemoNotice visible={hub.isDemo} /><section className="section shell"><MonthCalendar events={events} initialDate={events[0]?.date} /></section></>;
}
