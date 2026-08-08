import type { Metadata } from "next";
import { MonthCalendar } from "@/features/calendar/components/month-calendar";
import { getSeriesPremiereHub, sortByDate } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Estrenos" };

export default async function PremieresPage() {
  const hub = await getSeriesPremiereHub();
  const releases = sortByDate(hub.series, "premiereDate");
  const events = releases.map((item) => ({ id: item.id, slug: item.slug, title: item.title, date: item.premiereDate!, meta: `${item.season ?? "Nueva"} · ${item.platform}`, tone: item.posterTone }));
  return <><PageHero eyebrow="Calendario mensual" title="Lo próximo empieza aquí." copy="Nuevas temporadas, regresos esperados y primeras historias, organizadas por fecha de estreno." /><DemoNotice visible={hub.isDemo} /><section className="section shell"><MonthCalendar events={events} initialDate={events[0]?.date} /></section></>;
}
