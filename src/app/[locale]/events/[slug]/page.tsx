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
import { absoluteUrl, formatDateTime, cn } from "@/lib/utils";
import type { SanityEvent } from "@/lib/sanity.types";

interface EventPageProps {
  params: Promise<{ locale: string; slug: string }>;
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
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return {};
  }
  const title = `${event.title} · ${siteConfig.name}`;
  const description = `${event.title} @ ${event.venue ?? "TBA"} – ${formatDateTime(event.start, locale, {
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

export default async function EventPage({ params }: EventPageProps) {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }
  const [general] = await Promise.all([
    getTranslations("general"),
  ]);

  const soldOut = event.tags?.some((tag) => tag.toLowerCase().includes("sold"));
  const now = new Date();
  const cutoffDate = new Date(event.end ?? event.start);
  const ticketSalesEnabled = event.ticketSalesOpen !== false;
  const ticketSalesActive = ticketSalesEnabled && cutoffDate >= now;
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

  const marquee =
    event.marqueeText ??
    `${event.title.toUpperCase()} // ${formatDateTime(event.start, locale, {
      day: "2-digit",
      month: "short",
    }).toUpperCase()} ${new Date(event.start).getFullYear()}`;

  type ActionLink = {
    label: string;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    className?: string;
  };

  let buyTicketsLink: ActionLink | null = null;
  if (ticketSalesActive) {
    if (event.ticketingSource === "external" && event.externalTicketUrl) {
      buyTicketsLink = {
        label: general("buyTickets"),
        href: event.externalTicketUrl,
        external: true,
        disabled: soldOut,
        className: "event-action-link event-purchase-link",
      };
    } else if (event.ticketingSource === "pretix" && event.pretixTicketShopUrl) {
      buyTicketsLink = {
        label: general("buyTickets"),
        href: event.pretixTicketShopUrl,
        external: true,
        disabled: soldOut,
        className: "event-action-link event-purchase-link",
      };
    }
  }

  const renderActionLink = (link: ActionLink) => {
    const key = `${link.label}-${link.href ?? "noop"}`;
    const baseClasses = cn(
      "aer-nav-button aer-nav-button--compact event-action-link",
      link.className,
      link.disabled && "is-disabled",
    );

    if (link.disabled || !link.href) {
      return (
        <span key={key} className={baseClasses} aria-disabled="true">
          {link.label}
        </span>
      );
    }

    const isInternalRoute = !link.external && link.href.startsWith("/");

    if (isInternalRoute) {
      return (
        <Link key={key} href={link.href} className={baseClasses}>
          {link.label}
        </Link>
      );
    }

    return (
      <a
        key={key}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noreferrer" : undefined}
        className={baseClasses}
      >
        {link.label}
      </a>
    );
  };

  const backLink: ActionLink = {
    label: general("backToEvents"),
    href: "/events",
    external: false,
    className: "event-back-link",
  };

  const heroLinks: ActionLink[] = [backLink];
  if (buyTicketsLink) {
    heroLinks.push({ ...buyTicketsLink });
  }
  // Calendar link intentionally omitted per requirements

  const accessLinks: ActionLink[] = buyTicketsLink
    ? [{ ...buyTicketsLink }]
    : [
        {
          label: ticketSalesEnabled ? general("soldOut") : general("salesNotStarted"),
          disabled: true,
        },
      ];

  return (
    <>
      <SubpageFrame
        title={event.title}
        description={
          <p>
            {startStamp}
            {event.venue ? ` // ${event.venue.toUpperCase()}` : ""}
          </p>
        }
        marqueeText={marquee}
        actions={
          heroLinks.length ? (
            <div className="event-head-actions flex flex-wrap gap-3">{heroLinks.map(renderActionLink)}</div>
          ) : null
        }
      >
        <div className="event-detail">
          {event.poster?.asset ? (
            <figure className="aer-poster event-detail__poster">
              <Image
                src={urlFor(event.poster).width(1400).height(1800).quality(85).url()}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
              />
              {soldOut ? <span className="aer-poster__badge">{general("soldOut")}</span> : null}
            </figure>
          ) : null}

          <div className="event-detail__panels">
            <section className="aer-panel event-detail__panel">
              <div className="aer-panel__meta">Schedule</div>
              <div className="aer-list aer-list--grid-square">
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
            </section>
            <article id="event-details" className="aer-panel event-detail__panel">
              <div className="aer-panel__meta">Details</div>
              <PortableTextContent value={event.description} className="aer-panel__content space-y-4" />
            </article>

            {(accessLinks.length || event.address || event.ageLimit) ? (
              <section className="aer-panel event-detail__panel">
                <div className="aer-panel__meta">Access</div>
                <div className="event-detail__actions">
                  {accessLinks.map(renderActionLink)}
                  {event.address ? (
                    <a
                      className="aer-nav-button aer-nav-button--compact event-action-link event-map-link"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${event.venue ?? ""} ${event.address ?? ""}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {general("openMap")}
                    </a>
                  ) : null}
                  {event.ageLimit ? (
                    <span className="event-access-age">
                      <span className="event-access-age__label">Age limit</span>
                      <span className="event-access-age__value">{event.ageLimit}</span>
                    </span>
                  ) : null}
                </div>
              </section>
            ) : null}

            {event.lineup?.length ? (
              <section className="aer-panel event-detail__panel">
                <div className="aer-panel__meta">Line-up</div>
                <div className="aer-list aer-list--grid-square">
                  {event.lineup.map((artist) => (
                    <Link key={artist._id} href={`/artists/${artist.slug}`} className="aer-list__item">
                      <span className="aer-list__label">{artist.role ?? "Artist"}</span>
                      <span className="aer-list__value">{artist.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
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
