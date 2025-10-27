import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity.server";
import type { SanityEvent } from "@/lib/sanity.types";
import { cn, formatDateTime } from "@/lib/utils";
import { Link } from "@/i18n/routing";

interface EventCardProps {
  event: SanityEvent;
  locale: string;
  ctaLabel: string;
  readMoreLabel: string;
  showPoster?: boolean;
}

export function EventCard({
  event,
  locale,
  ctaLabel,
  readMoreLabel,
  showPoster = true,
}: EventCardProps) {
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
    <article
      className={cn(
        "group overflow-hidden border border-[rgba(243,243,243,0.08)] bg-[rgba(12,12,12,0.86)] transition-transform duration-200 hover:border-accent/35",
        showPoster ? "md:grid md:grid-cols-[minmax(0,240px),1fr]" : "",
      )}
    >
      {showPoster && event.poster?.asset ? (
        <Link
          href={`/events/${event.slug}`}
          className="poster-pixel-melt relative block h-full border-b border-[rgba(243,243,243,0.05)] bg-surface/70 md:border-b-0 md:border-r"
        >
          <Image
            src={urlFor(event.poster).width(780).height(1040).quality(80).url()}
            alt={event.title}
            width={780}
            height={1040}
            className="h-full w-full object-cover"
          />
          {soldOut && (
            <div className="absolute left-4 top-4">
              <Badge variant="muted">Sold Out</Badge>
            </div>
          )}
        </Link>
      ) : null}
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-4">
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-muted">
            {[
              "Berlin",
              event.venue?.toUpperCase() ?? "TBA",
              startDate.toUpperCase(),
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
          <h3 className="font-display text-[2.35rem] uppercase leading-[0.92]">
            {event.title}
          </h3>
          <div className="text-[0.74rem] uppercase tracking-[0.2em] text-muted">
            <span>{startTime} CET</span>
            {event.address ? <span className="ml-2">• {event.address}</span> : null}
          </div>
          {event.lineup?.length ? (
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted/80">
              {event.lineup.map((artist) => artist.name).join(" • ")}
            </p>
          ) : null}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant={soldOut ? "outline" : "primary"}
            size="sm"
            className={cn("min-w-[10rem]", soldOut && "text-muted")}
            data-beam={soldOut ? undefined : ""}
          >
            <Link href={`/events/${event.slug}`}>
              {soldOut ? readMoreLabel : ctaLabel}
            </Link>
          </Button>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-muted transition-colors hover:text-foreground"
          >
            {readMoreLabel}
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
