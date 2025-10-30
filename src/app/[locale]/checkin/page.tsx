import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { CheckInClient } from "./checkin-client";
import { getEvents } from "@/server/sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user && env.USE_MOCK_AUTH !== "true") {
    redirect({
      href: { pathname: "/auth/sign-in", query: { callbackUrl: "/checkin" } },
      locale,
    });
  }
  if (session?.user && !["ADMIN", "STAFF"].includes(session.user.role)) {
    redirect({ href: "/", locale });
  }

  const [events, navT] = await Promise.all([
    getEvents(),
    getTranslations("navigation"),
  ]);

  const eventOptions = events
    .filter((event) => event.pretixEventId)
    .map((event) => ({
      title: event.title,
      slug: event.slug,
      pretixEventId: event.pretixEventId!,
    }));

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title="Door validation console"
      description={<p>Scan Pretix QR codes. Instant duplicate detection, live redemption.</p>}
      marqueeText="// CHECK-IN // ACCESS CONTROL"
      footnote="Requires ADMIN or STAFF session. Mock auth enabled via env flag."
      navigation={navigation}
    >
      <div className="aer-panel">
        <CheckInClient events={eventOptions} />
      </div>
    </SubpageFrame>
  );
}
