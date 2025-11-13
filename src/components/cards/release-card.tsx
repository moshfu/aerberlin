import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity.server";
import type { SanityRelease } from "@/lib/sanity.types";

interface ReleaseCardProps {
  release: SanityRelease;
  title: string;
  ctaLabel: string;
}

export function ReleaseCard({ release, title, ctaLabel }: ReleaseCardProps) {
  const links = Object.entries(release.links ?? {}).filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <article className="grid overflow-hidden border border-[rgba(243,243,243,0.08)] bg-[rgba(12,12,12,0.86)] md:grid-cols-[minmax(0,240px),1fr]">
      <div className="poster-pixel-melt relative aspect-square border-b border-[rgba(243,243,243,0.08)] md:border-b-0 md:border-r">
        {release.cover?.asset ? (
          <Image
            src={urlFor(release.cover).width(800).height(800).quality(85).url()}
            alt={release.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            {release.title}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-3">
          <p className="text-[0.66rem] uppercase tracking-[0.26em] text-muted">
            {title}
          </p>
          <h3 className="font-display text-[2.15rem] leading-[0.94]">
            {release.title}
          </h3>
          {release.date ? (
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted/80">
              {new Intl.DateTimeFormat("en", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(release.date))}
            </p>
          ) : null}
        </div>
        {links.length ? (
          <div className="flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-[0.24em]">
            {links.map(([key, value]) => (
              <Button
                key={key}
                asChild
                variant="secondary"
                size="xs"
                className="px-4"
              >
                <a href={value} target="_blank" rel="noreferrer">
                  {key}
                  <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                </a>
              </Button>
            ))}
          </div>
        ) : (
          <Button variant="ghost" size="xs" disabled className="w-fit text-muted">
            {ctaLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
