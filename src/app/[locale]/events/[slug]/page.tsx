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
import { buildCanonical } from "@/lib/seo";
import type { SanityEvent } from "@/lib/sanity.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

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
  const canonical = buildCanonical(`/${locale}/events/${slug}`);
  return {
    title,
    description,
    keywords: ["aer event", "aer kollektiv", "berlin trance event", event.title],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
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
      site: canonical,
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

  const accessNote = !buyTicketsLink && ticketSalesEnabled === false
    ? general("salesNotStarted")
    : null;

  const accessLinks: ActionLink[] = buyTicketsLink ? [{ ...buyTicketsLink }] : [];

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

            {(accessLinks.length || event.address || event.ageLimit || accessNote) ? (
              <section className="aer-panel event-detail__panel">
                <div className="aer-panel__meta">Access</div>
                <div className="event-detail__actions">
                  {accessLinks.map(renderActionLink)}
                  {accessNote ? (
                    <span className="text-[0.78rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.78)]">
                      {accessNote}
                    </span>
                  ) : null}
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

      <EventStructuredData event={event} locale={locale} />
    </>
  );
}

function EventStructuredData({ event, locale }: { event: SanityEvent; locale: string }) {
  const url = absoluteUrl(`/${locale}/events/${event.slug}`);
  const image = event.poster?.asset
    ? urlFor(event.poster).width(1200).height(1600).quality(80).url()
    : undefined;
  const lineupNames = event.lineup?.map((artist) => artist.name).filter(Boolean) ?? [];
  const description =
    typeof event.description === "string"
      ? event.description
      : lineupNames.length
        ? lineupNames.join(" · ")
        : event.title;
  const eventStatus =
    new Date(event.end ?? event.start) < new Date()
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled";
  const soldOut = event.tags?.some((tag) => tag.toLowerCase().includes("sold")) ?? false;
  const availability = soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock";
  const ticketUrl =
    event.ticketingSource === "external"
      ? event.externalTicketUrl
      : event.ticketingSource === "pretix"
        ? event.pretixTicketShopUrl
        : undefined;

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    startDate: new Date(event.start).toISOString(),
    endDate: event.end ? new Date(event.end).toISOString() : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus,
    location: event.venue
      ? {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Berlin",
            addressCountry: "DE",
          },
        }
      : undefined,
    image: image ? [image] : undefined,
    description,
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl(`/${locale}`),
    },
    performer: lineupNames.map((name) => ({ "@type": "MusicGroup", name })),
    offers: ticketUrl
      ? [
          {
            "@type": "Offer",
            url: ticketUrl,
            availability,
          },
        ]
      : undefined,
    url,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: absoluteUrl(`/${locale}/events`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
