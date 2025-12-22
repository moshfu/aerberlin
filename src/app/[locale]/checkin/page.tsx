import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { serverConfig } from "@/server/config";
import { CheckInClient } from "./checkin-client";
import { getEvents } from "@/server/sanity";
import { getPretixEventTitles } from "@/server/pretix";
import { SubpageFrame } from "@/components/layout/subpage-frame";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user && !serverConfig.useMockAuth) {
    redirect({
      href: { pathname: "/auth/sign-in", query: { callbackUrl: `/${locale}/checkin` } },
      locale,
    });
  }
  if (session?.user && !["ADMIN", "STAFF"].includes(session.user.role)) {
    redirect({ href: "/", locale });
  }

  const events = await getEvents();
  const pretixNames = await getPretixEventTitles();

  const eventOptions = events
    .filter((event) => event.pretixEventId)
    .map((event) => ({
      title: pretixNames.get(event.pretixEventId!) ?? event.title,
      slug: event.slug,
      pretixEventId: event.pretixEventId!,
    }));

  return (
    <SubpageFrame
      title="Door validation console"
      description={<p>Scan Pretix QR codes. Instant duplicate detection, live redemption.</p>}
      marqueeText="// CHECK-IN // ACCESS CONTROL"
      footnote="Requires ADMIN or STAFF session. Mock auth enabled via env flag."
    >
      <div className="aer-panel">
        <CheckInClient events={eventOptions} />
      </div>
    </SubpageFrame>
  );
}
