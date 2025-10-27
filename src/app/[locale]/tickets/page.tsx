import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { TicketShop } from "@/components/tickets/ticket-shop";
import { getEvents } from "@/server/sanity";
import { getPretixCatalog } from "@/server/pretix";
import type { TicketCatalog } from "@/types/ticket";
import { cn } from "@/lib/utils";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";

export default async function TicketsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [t, general, navT] = await Promise.all([
    getTranslations("tickets"),
    getTranslations("general"),
    getTranslations("navigation"),
  ]);

  const events = (await getEvents()).filter((event) => event.pretixEventId);
  const requestedSlug = typeof searchParams.event === "string" ? searchParams.event : undefined;
  const selectedEvent = events.find((event) => event.slug === requestedSlug) ?? events[0];

  let catalog: TicketCatalog | null = null;
  if (selectedEvent?.pretixEventId) {
    try {
      const pretix = await getPretixCatalog(selectedEvent.pretixEventId);
      const localize = (map?: Record<string, string>) => {
        if (!map) return undefined;
        const dict: Record<string, string> = map;
        return dict[locale] ?? dict.en ?? Object.values(dict)[0];
      };
      catalog = {
        eventSlug: selectedEvent.slug,
        pretixEventSlug: selectedEvent.pretixEventId,
        eventTitle: selectedEvent.title,
        products: pretix.products.map(({ product, availability }) => ({
          productId: product.id,
          name: localize(product.name) ?? "Ticket",
          description: localize(product.description) ?? "",
          price: Number.parseFloat(product.default_price),
          currency: "EUR",
          available: availability?.available ?? null,
        })),
      };
    } catch (error) {
      console.error("Pretix catalog error", error);
    }
  }

  const checkoutEnabled = Boolean(catalog);

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title={t("title")}
      eyebrow="Access"
      description={<p>{t("instructions")}</p>}
      marqueeText="TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//TICKETS//"
      navigation={navigation}
      actions={
        events.length ? (
          <nav className="aer-chipset" aria-label="Ticketed events">
            {events.map((event) => (
              <Link
                key={event._id}
                href={{ pathname: "/tickets", query: { event: event.slug } }}
                className={cn(selectedEvent?.slug === event.slug && "is-active")}
              >
                {event.title}
              </Link>
            ))}
          </nav>
        ) : null
      }
      footnote={
        checkoutEnabled
          ? "Live checkout enabled via Pretix."
          : "Demo mode — add a Pretix event id in Sanity to activate checkout."
      }
    >
      {!events.length ? (
        <div className="aer-panel text-[0.78rem] uppercase tracking-[0.2em] text-muted">
          Pretix is not configured. Add a `pretixEventId` in Sanity to hydrate the live catalog.
        </div>
      ) : (
        <div className="space-y-6">
          <TicketShop
            catalog={catalog}
            locale={locale}
            checkoutLabel={general("checkout")}
            emptyLabel={t("instructions")}
            totalLabel={general("total")}
            successRedirectLabel="Redirecting to secure checkout"
            checkoutEnabled={checkoutEnabled}
          />
        </div>
      )}
    </SubpageFrame>
  );
}
