import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { urlFor } from "@/lib/sanity.server";
import type { SanityArtist } from "@/lib/sanity.types";
import { Link } from "@/i18n/routing";

interface ArtistCardProps {
  artist: SanityArtist;
  readMoreLabel: string;
}

export function ArtistCard({ artist, readMoreLabel }: ArtistCardProps) {
  return (
    <article className="group border border-[rgba(243,243,243,0.08)] bg-[rgba(12,12,12,0.82)] transition-colors duration-200 hover:border-accent/45">
      <Link
        href={`/artists/${artist.slug}`}
        className="poster-pixel-melt relative block aspect-[4/5] overflow-hidden border-b border-[rgba(243,243,243,0.08)] bg-surface/70"
      >
        {artist.portrait?.asset ? (
          <Image
            src={urlFor(artist.portrait).width(640).height(800).quality(80).url()}
            alt={artist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            {artist.name}
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.8rem] uppercase leading-[0.92]">
            {artist.name}
          </h3>
          {artist.role ? <Badge variant="muted">{artist.role}</Badge> : null}
        </div>
        {artist.tags?.length ? (
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted/80">
            {artist.tags.join(" • ")}
          </p>
        ) : null}
        <Button
          asChild
          variant="ghost"
          className="mt-auto justify-between px-0 text-[0.68rem] uppercase tracking-[0.24em] text-muted hover:text-foreground"
        >
          <Link href={`/artists/${artist.slug}`}>
            {readMoreLabel}
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
