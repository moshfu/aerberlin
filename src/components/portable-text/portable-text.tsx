import { PortableText, type PortableTextReactComponents } from "@portabletext/react";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity.server";

const components: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      const url = urlFor(value).width(1200).quality(85).url();
      return (
        <div className="my-6 overflow-hidden rounded-3xl">
          <Image
            src={url}
            alt={value.alt ?? ""}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
          />
          {value.caption && (
            <p className="mt-2 text-xs text-muted-foreground">{value.caption}</p>
          )}
        </div>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 font-display text-3xl uppercase tracking-tightest">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-display text-2xl uppercase tracking-tightest">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-accent pl-6 text-lg italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith("/") ? "noreferrer noopener" : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={rel ? "_blank" : undefined}
          className="underline underline-offset-4"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <span className="font-semibold text-foreground">{children}</span>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
        {children}
      </ol>
    ),
  },
};

export function PortableTextContent({
  value,
  className,
}: {
  value: PortableTextBlock[];
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
