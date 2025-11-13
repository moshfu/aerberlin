import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getEvents } from "@/server/sanity";
import type { SanityEvent } from "@/lib/sanity.types";
import { cn, formatDateTime } from "@/lib/utils";
import { SubpageFrame } from "@/components/layout/subpage-frame";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams]);
  const [t, general] = await Promise.all([
    getTranslations("events"),
    getTranslations("general"),
  ]);
  const events = await getEvents();
  const now = new Date();

  const upcoming = events.filter((event) => new Date(event.start) >= now);
  const past = events.filter((event) => new Date(event.start) < now);

  const statusParam = Array.isArray(search.status)
    ? search.status[0]
    : search.status;
  const status = statusParam === "past" ? "past" : "upcoming";
  const description = "Schedule. Archive.";

  // Top navigation not shown on this page

  return (
    <SubpageFrame
      title={t("title")}
      description={<p>{description}</p>}
      marqueeText="// EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS //"
      actions={
        <EventFilters
          status={status}
          items={[
            { label: t("filter.upcoming"), value: "upcoming" },
            { label: t("filter.past"), value: "past" },
          ]}
        />
      }
    >
      <EventsList
        locale={locale}
        events={(status === "past" ? past : upcoming).sort((a, b) =>
          status === "past"
            ? +new Date(b.start) - +new Date(a.start)
            : +new Date(a.start) - +new Date(b.start)
        )}
        ctaLabel={general("buyTickets")}
        readMoreLabel={general("readMore")}
        emptyLabel={t("noEvents")}
        soldOutLabel={general("soldOut")}
      />
    </SubpageFrame>
  );
}

function EventsList({
  events,
  locale,
  ctaLabel,
  readMoreLabel,
  emptyLabel,
  soldOutLabel,
}: {
  events: SanityEvent[];
  locale: string;
  ctaLabel: string;
  readMoreLabel: string;
  emptyLabel: string;
  soldOutLabel: string;
}) {
  if (!events.length) {
    return (
      <div className="aer-panel text-center text-[0.78rem] uppercase tracking-[0.28em] text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="aer-rail">
      {events.map((event) => (
        <EventRailItem
          key={event._id}
          event={event}
          locale={locale}
          ctaLabel={ctaLabel}
          readMoreLabel={readMoreLabel}
          soldOutLabel={soldOutLabel}
        />
      ))}
    </div>
  );
}

// Calendar view removed per requirements

function EventRailItem({
  event,
  locale,
  ctaLabel,
  readMoreLabel,
  soldOutLabel,
}: {
  event: SanityEvent;
  locale: string;
  ctaLabel: string;
  readMoreLabel: string;
  soldOutLabel: string;
}) {
  const startDate = formatDateTime(event.start, locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const startTime = formatDateTime(event.start, locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const soldOut = event.tags?.some((tag) => tag.toLowerCase().includes("sold"));
  const meta = `${startDate} · ${startTime} CET${event.venue ? ` · ${event.venue.toUpperCase()}` : ""}`;
  const lineupSummary = event.lineup?.length
    ? event.lineup.map((artist) => artist.name).join(" · ")
    : null;

  return (
    <article
      className={cn(
        "aer-panel aer-event space-y-5 border-[rgba(255,255,255,0.18)] bg-[rgba(10,10,10,0.92)] backdrop-blur",
        soldOut && "border-[rgba(255,16,42,0.4)]/80 opacity-80",
      )}
    >
      <header className="space-y-3">
        <div className="text-[0.72rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.75)]">
          {meta}
        </div>
        <h3 className="aer-panel__heading text-[1.8rem] leading-tight">{event.title}</h3>
        {lineupSummary ? (
          <p className="text-[0.82rem] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.75)]">
            {lineupSummary}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-3 text-[0.78rem] uppercase tracking-[0.22em]">
        <Link
          href={`/events/${event.slug}`}
          className="aer-nav-button aer-rail__cta"
        >
          {readMoreLabel}
        </Link>
        <Link
          href={`/tickets?event=${event.slug}`}
          className={cn(
            "aer-nav-button aer-rail__cta",
            soldOut && "is-disabled",
          )}
          aria-disabled={soldOut}
        >
          {soldOut ? soldOutLabel : ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function EventFilters({
  status,
  items,
}: {
  status: string;
  items: { label: string; value: string }[];
}) {
  return (
    <nav className="aer-chipset flex flex-wrap gap-3" aria-label="Event filters">
      {items.map((item) => {
        const href = item.value === "upcoming"
          ? { pathname: "/events" }
          : { pathname: "/events", query: { status: item.value } };
        return (
          <Link
            key={item.value}
            href={href}
            className={cn(
              "aer-nav-button aer-nav-button--compact",
              status === item.value && "is-active",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
