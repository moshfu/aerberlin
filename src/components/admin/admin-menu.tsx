"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/routing";

const ADMIN_LINKS = [
  { label: "Admin dashboard", href: "/admin", description: "Overview of events, releases, pretix sync." },
  { label: "Sanity studio", href: "/studio", description: "Edit pages, imagery and copy in the CMS." },
  { label: "Create event", href: "/studio/desk/intent/create/type=event", description: "Add a new event entry in Sanity.", external: false },
  { label: "Create artist", href: "/studio/desk/intent/create/type=artist", description: "Onboard a new roster profile.", external: false },
  { label: "Create release", href: "/studio/desk/intent/create/type=release", description: "Add music drops, embeds and artwork.", external: false },
  { label: "Check-in console", href: "/checkin", description: "Pretix QR validation at the door." },
];

export function AdminMenu() {
  const { data } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const canAccess = Boolean(data?.user && ["ADMIN", "EDITOR"].includes(data.user.role));

  useEffect(() => {
    if (!canAccess) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canAccess]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!canAccess) {
    return null;
  }

  const content = open ? (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-2xl border border-[rgba(255,255,255,0.18)] bg-[rgba(8,8,8,0.94)] p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.32em] text-[rgba(255,255,255,0.55)]">
              Admin surface
            </p>
            <h2 className="mt-2 font-display text-[1.9rem] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.92)]">
              Operations menu
            </h2>
            <p className="mt-2 max-w-md text-[0.68rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
              Press ⌘⇧A / Ctrl⇧A to toggle. Escape closes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="self-end text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.55)] transition hover:text-foreground"
          >
            Close ✕
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {ADMIN_LINKS.map((link) => {
            const isExternal = link.href.startsWith("http");
            const contentNode = (
              <div className="aer-list__item !border-[rgba(255,255,255,0.16)] hover:!border-[rgba(255,16,42,0.45)]">
                <span className="aer-list__label">{link.label}</span>
                <span className="aer-list__value text-left text-[0.64rem] leading-relaxed tracking-[0.18em] text-[rgba(255,255,255,0.6)]">
                  {link.description}
                </span>
              </div>
            );
            if (isExternal || link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,16,42,0.45)]"
                >
                  {contentNode}
                </a>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,16,42,0.45)]"
              >
                {contentNode}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="sr-only"
        aria-label="Open admin menu"
        onClick={() => setOpen(true)}
      />
      {typeof window !== "undefined" ? createPortal(content, document.body) : null}
    </>
  );
}
