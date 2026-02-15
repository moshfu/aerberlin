import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getEvents } from "@/server/sanity";
import { cn, formatDateTime } from "@/lib/utils";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PurchaseWidget } from "@/components/tickets/purchase-widget";

export default async function TicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const [t, general] = await Promise.all([
    getTranslations("tickets"),
    getTranslations("general"),
  ]);

  const now = new Date();
  const events = (await getEvents()).filter((event) => {
    if (event.ticketingSource !== "pretix") return false;
    if (!event.pretixEventId) return false;
    const cutoff = new Date(event.end ?? event.start);
    return cutoff >= now;
  });
  const requestedSlug = typeof query.event === "string" ? query.event : undefined;
  const selectedEvent = events.find((event) => event.slug === requestedSlug) ?? null;
  const hasEvents = events.length > 0;
  const activeEvent = hasEvents ? selectedEvent ?? events[0] : null;
  const primaryBlock =
    activeEvent?.description?.find(
      (block) => block?._type === "block" && Array.isArray(block.children),
    ) ?? null;
  const rawPreviewCopy = Array.isArray(primaryBlock?.children)
    ? primaryBlock.children.find(isPortableTextSpan)?.text ?? null
    : null;
  const previewCopy =
    rawPreviewCopy && !/^\s*line[\s-]?up\s*:?\s*$/i.test(rawPreviewCopy)
      ? rawPreviewCopy
      : null;

  return (
      <SubpageFrame
        title={t("title")}
        marqueeText="TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//"
        actions={
          hasEvents ? (
            <nav className="aer-chipset" aria-label="Ticketed events">
              {events.map((event) => (
                <Link
                  key={event._id}
                  href={{ pathname: "/tickets", query: { event: event.slug } }}
                  className={cn(
                    "aer-nav-button aer-nav-button--compact",
                    selectedEvent?.slug === event.slug && "is-active",
                  )}
                >
                  {event.title}
                </Link>
              ))}
              {activeEvent ? (
                <Link
                  href={{ pathname: `/events/${activeEvent.slug}` }}
                  className="aer-nav-button aer-nav-button--compact"
                >
                  Back to event
                </Link>
              ) : null}
            </nav>
          ) : null
        }
        footnote={undefined}
    >
      {!hasEvents ? (
        <div className="aer-panel text-[0.78rem] uppercase tracking-[0.2em] text-muted">
          Pretix links are not configured. Add a Pretix ticket shop URL in Sanity to enable sales.
        </div>
      ) : activeEvent && activeEvent.pretixEventId ? (
        <section className="space-y-4">
          <header className="space-y-2">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.55)]">
              {formatDateTime(activeEvent.start, locale, {
                weekday: "long",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {activeEvent.venue ? ` · ${activeEvent.venue}` : ""}
            </p>
            <h2 className="font-display text-[2.2rem] tracking-[0.08em] text-foreground">
              {activeEvent.title}
            </h2>
          </header>
          {previewCopy ? (
            <p className="text-sm uppercase tracking-[0.18em] text-[rgba(255,255,255,0.65)]">
              {previewCopy}
            </p>
          ) : null}
          {activeEvent.ticketSalesOpen === false ? (
            <div className="aer-panel text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.62)]">
              {general("salesNotStarted")}
            </div>
          ) : (
            <PurchaseWidget pretixEventId={activeEvent.pretixEventId} />
          )}
        </section>
      ) : null}
    </SubpageFrame>
  );
}

interface PortableChild {
  _type?: string;
  text?: string;
}

function isPortableTextSpan(child: PortableChild | undefined): child is PortableChild & { text: string } {
  return Boolean(child && child._type === "span" && typeof child.text === "string");
}
