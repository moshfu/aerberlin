"use client";

import { useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import type { SanityImage } from "@/lib/sanity.types";
import { urlFor } from "@/lib/sanity.server";

interface LightboxGalleryProps {
  items: Array<{
    id: string;
    image: SanityImage;
    caption?: string;
    credit?: string;
  }>;
}

export function LightboxGallery({ items }: LightboxGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = typeof openIndex === "number";
  const current = typeof openIndex === "number" ? items[openIndex] : null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.92)] transition hover:border-[rgba(255,16,42,0.45)]"
            onClick={() => setOpenIndex(index)}
          >
            <Image
              src={urlFor(item.image).width(900).height(700).quality(85).url()}
              alt={item.caption ?? "Gallery image"}
              width={900}
              height={700}
              className="h-auto w-full object-cover transition duration-300 group-hover:scale-105"
            />
            {item.caption ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
                <p className="text-sm font-medium text-foreground">{item.caption}</p>
                {item.credit ? (
                  <p className="text-xs text-muted-foreground">{item.credit}</p>
                ) : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>
      <Sheet open={open} onOpenChange={(value) => !value && setOpenIndex(null)}>
        <SheetContent
          side="bottom"
          className="h-[90vh] max-w-5xl overflow-hidden border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.98)]"
        >
          <SheetClose className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.18)] text-muted transition-colors hover:border-[rgba(255,16,42,0.4)] hover:text-foreground">
            <XIcon className="h-4 w-4" />
          </SheetClose>
          {current ? (
            <div className="flex h-full flex-col gap-4">
              <div className="relative flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.12)] bg-[rgba(10,10,10,0.92)]">
                <Image
                  src={urlFor(current.image).width(1600).height(1200).quality(90).url()}
                  alt={current.caption ?? "Gallery image"}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {current.caption}
                {current.credit ? (
                  <span className="ml-2 text-xs uppercase tracking-[0.3em]">© {current.credit}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
