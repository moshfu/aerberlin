import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getEvents } from "@/server/sanity";
import type { SanityEvent } from "@/lib/sanity.types";
import { cn, formatDateTime } from "@/lib/utils";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";

export default async function EventsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [t, general, navT] = await Promise.all([
    getTranslations("events"),
    getTranslations("general"),
    getTranslations("navigation"),
  ]);
  const events = await getEvents();
  const now = new Date();

  const upcoming = events.filter((event) => new Date(event.start) >= now);
  const past = events.filter((event) => new Date(event.start) < now);

  const status = typeof searchParams.status === "string" ? searchParams.status : "upcoming";
  const description = `${general("tagline")} // schedule + archive feed.`;

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title={t("title")}
      eyebrow="Schedule"
      description={<p>{description}</p>}
      marqueeText="// EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS //"
      navigation={navigation}
      actions={
        <EventFilters
          status={status}
          items={[
            { label: t("filter.upcoming"), value: "upcoming" },
            { label: t("filter.past"), value: "past" },
            { label: t("filter.calendar"), value: "calendar" },
          ]}
        />
      }
      footnote={
        status === "calendar"
          ? "Calendar view auto-updates every 5 minutes from Sanity + Pretix."
          : "Listings display local time (CET) with live ticket status."
      }
    >
      {status === "calendar" ? (
        <EventsCalendar locale={locale} events={events} />
      ) : (
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
      )}
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

function EventsCalendar({
  events,
  locale,
}: {
  events: SanityEvent[];
  locale: string;
}) {
  if (!events.length) {
    return (
      <div className="aer-panel text-center text-[0.78rem] uppercase tracking-[0.28em] text-muted">
        No events found.
      </div>
    );
  }

  const grouped = events
    .slice()
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .reduce<Record<string, SanityEvent[]>>((acc, event) => {
      const key = formatDateTime(event.start, locale, {
        month: "long",
        year: "numeric",
      });
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});

  return (
    <div className="aer-grid">
      {Object.entries(grouped).map(([month, items]) => (
        <section key={month} className="aer-panel">
          <div className="aer-panel__meta">Calendar month</div>
          <h3 className="aer-panel__heading">{month}</h3>
          <div className="aer-list">
            {items.map((event) => (
              <Link
                key={event._id}
                href={`/events/${event.slug}`}
                className={cn("aer-list__item hover:border-[rgba(255,16,42,0.38)]")}
              >
                <span className="aer-list__label">
                  {formatDateTime(event.start, locale, {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="aer-list__value">
                  {event.title}
                  {event.venue ? ` // ${event.venue.toUpperCase()}` : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

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

  return (
    <article className="aer-rail__item">
      <div className="aer-rail__meta">
        {`${startDate} // ${startTime} CET${event.venue ? ` // ${event.venue.toUpperCase()}` : ""}`}
      </div>
      <h3 className="aer-rail__title">{event.title}</h3>
      {event.lineup?.length ? (
        <p className="aer-rail__description">
          {event.lineup.map((artist) => artist.name).join(" · ")}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em]">
        <Link href={`/events/${event.slug}`} className="aer-rail__cta">
          {readMoreLabel}
          <span aria-hidden="true">↗</span>
        </Link>
        <Link
          href={`/tickets?event=${event.slug}`}
          className={cn(
            "aer-rail__cta",
            soldOut && "text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.35)]",
          )}
        >
          {soldOut ? soldOutLabel : ctaLabel}
          {!soldOut ? <span aria-hidden="true">◎</span> : null}
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
    <nav className="aer-chipset" aria-label="Event filters">
      {items.map((item) => (
        <Link
          key={item.value}
          href={{ pathname: "/events", query: { status: item.value } }}
          className={cn(status === item.value && "is-active")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
