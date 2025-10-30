import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { getEvents, getReleases } from "@/server/sanity";
import { getPretixEvents } from "@/server/pretix";
import { siteConfig } from "@/config/site";
import { AdminConsole } from "@/components/admin/admin-console";

export const revalidate = 120;

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect({
      href: { pathname: "/auth/sign-in", query: { callbackUrl: "/admin" } },
      locale,
    });
  }
  if (session.user.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  const [events, releases, pretix, navT] = await Promise.all([
    getEvents(),
    getReleases(),
    getPretixEvents().catch(() => []),
    getTranslations("navigation"),
  ]);

  const upcoming = events.filter((event) => new Date(event.start) >= new Date());
  const past = events.length - upcoming.length;

  const metrics: { title: string; value: string; subtitle: string }[] = [
    { title: "Upcoming events", value: String(upcoming.length), subtitle: `${past} archived` },
    { title: "Releases", value: String(releases.length), subtitle: `Latest: ${releases[0]?.title ?? "n/a"}` },
    { title: "Pretix events", value: String(pretix.length), subtitle: `Synced ${new Date().toLocaleTimeString()}` },
  ];

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title="Operations dashboard"
      description={<p>Realtime snapshot across Pretix, Sanity and Stripe.</p>}
      marqueeText="AER BERLIN // ADMIN // OPERATIONS"
      footnote="Data refreshes every 120 seconds."
      navigation={navigation}
    >
      <div className="space-y-8">
        <div className="aer-grid aer-grid--three">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
        <AdminConsole />
      </div>
    </SubpageFrame>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="aer-panel aer-stat">
      <span className="aer-stat__meta">{title}</span>
      <span className="aer-stat__value">{value}</span>
      <span className="aer-stat__note">{subtitle}</span>
    </div>
  );
}
