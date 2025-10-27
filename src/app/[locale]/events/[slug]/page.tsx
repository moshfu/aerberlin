import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";
import { urlFor } from "@/lib/sanity.server";
import { getEventBySlug, getEvents } from "@/server/sanity";
import { absoluteUrl, formatDateTime } from "@/lib/utils";
import type { SanityEvent } from "@/lib/sanity.types";

interface EventPageProps {
  params: { locale: string; slug: string };
}

export const revalidate = 120;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.flatMap((event) =>
    siteConfig.locales.map((locale) => ({
      locale,
      slug: event.slug,
    })),
  );
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) {
    return {};
  }
  const title = `${event.title} · ${siteConfig.name}`;
  const description = `${event.title} @ ${event.venue ?? "TBA"} – ${formatDateTime(event.start, params.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  const imageUrl = event.poster?.asset
    ? urlFor(event.poster).width(1200).height(1600).quality(80).url()
    : "/og.jpg";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1600,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EventPage({ params: { locale, slug } }: EventPageProps) {
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }
  const [general, navT] = await Promise.all([
    getTranslations("general"),
    getTranslations("navigation"),
  ]);

  const soldOut = event.tags?.some((tag) => tag.toLowerCase().includes("sold"));
  const startStamp = formatDateTime(event.start, locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endStamp = event.end
    ? formatDateTime(event.end, locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const marquee = `${event.title.toUpperCase()} // ${formatDateTime(event.start, locale, {
    day: "2-digit",
    month: "short",
  }).toUpperCase()} ${new Date(event.start).getFullYear()}`;

  const ticketLinks = [
    !soldOut && event.ticketingSource !== "external"
      ? {
          label: general("buyTickets"),
          href: `/tickets?event=${event.slug}`,
          external: false,
        }
      : null,
    event.ticketingSource === "external" && event.externalTicketUrl
      ? {
          label: general("buyTickets"),
          href: event.externalTicketUrl,
          external: true,
        }
      : null,
    {
      label: "Add to calendar",
      href: `/api/events/${event.slug}/ics`,
      external: false,
    },
  ].filter((link): link is { label: string; href: string; external: boolean } => Boolean(link));

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <>
      <SubpageFrame
        title={event.title}
        eyebrow="Event"
        description={
          <p>
            {startStamp}
            {event.venue ? ` // ${event.venue.toUpperCase()}` : ""}
          </p>
        }
        marqueeText={marquee}
        navigation={navigation}
        meta={
          event.tags?.length ? (
            <div className="aer-tag-strip">
              {event.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null
        }
        actions={
          <div className="flex flex-wrap gap-3">
            {ticketLinks.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="aer-rail__cta">
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="aer-rail__cta">
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              ),
            )}
          </div>
        }
        footnote="Event data mirrors Sanity + Pretix. Times are local (CET)."
      >
        <div className="aer-grid aer-grid--two">
          <div className="aer-grid">
            {event.poster?.asset ? (
              <figure className="aer-poster">
                <Image
                  src={urlFor(event.poster).width(1400).height(1800).quality(85).url()}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                />
                {soldOut ? <span className="aer-poster__badge">{general("soldOut")}</span> : null}
              </figure>
            ) : null}
            <div className="aer-list">
              <div className="aer-list__item">
                <span className="aer-list__label">Start</span>
                <span className="aer-list__value">{startStamp}</span>
              </div>
              {endStamp ? (
                <div className="aer-list__item">
                  <span className="aer-list__label">End</span>
                  <span className="aer-list__value">{endStamp}</span>
                </div>
              ) : null}
              {event.venue ? (
                <div className="aer-list__item">
                  <span className="aer-list__label">Venue</span>
                  <span className="aer-list__value">{event.venue}</span>
                </div>
              ) : null}
              {event.address ? (
                <div className="aer-list__item">
                  <span className="aer-list__label">Address</span>
                  <span className="aer-list__value">{event.address}</span>
                </div>
              ) : null}
            </div>
          </div>
          <article className="aer-panel">
            <div className="aer-panel__meta">Details</div>
            <PortableTextContent value={event.description} className="aer-panel__content space-y-4" />
          </article>
        </div>

        {event.lineup?.length ? (
          <section className="aer-panel">
            <div className="aer-panel__meta">Line-up</div>
            <div className="aer-list">
              {event.lineup.map((artist) => (
                <Link key={artist._id} href={`/artists/${artist.slug}`} className="aer-list__item">
                  <span className="aer-list__label">Artist</span>
                  <span className="aer-list__value">{artist.name}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="aer-panel">
          <div className="aer-panel__meta">Access</div>
          <div className="flex flex-wrap gap-3">
            {ticketLinks.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="aer-rail__cta">
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="aer-rail__cta">
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              ),
            )}
          </div>
          {event.address ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${event.venue ?? ""} ${event.address ?? ""}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="aer-rail__cta mt-4"
            >
              Open map
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </section>
      </SubpageFrame>

      <StructuredData event={event} />
    </>
  );
}

function StructuredData({ event }: { event: SanityEvent }) {
  const start = new Date(event.start).toISOString();
  const end = event.end ? new Date(event.end).toISOString() : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    startDate: start,
    endDate: end,
    location: {
      "@type": "MusicVenue",
      name: event.venue,
      address: event.address,
    },
    performer: event.lineup?.map((artist) => ({
      "@type": "MusicGroup",
      name: artist.name,
    })),
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    offers: {
      "@type": "Offer",
      url:
        event.ticketingSource === "external" && event.externalTicketUrl
          ? event.externalTicketUrl
          : absoluteUrl(`/tickets?event=${event.slug}`),
      priceCurrency: event.tiers?.[0]?.currency ?? "EUR",
      availabilityStarts: start,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}
