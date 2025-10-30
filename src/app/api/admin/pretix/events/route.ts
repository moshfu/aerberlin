import { NextResponse } from "next/server";
import groq from "groq";
import { auth } from "@/lib/auth";
import { sanityClient } from "@/lib/sanity.server";
import { getPretixEvents } from "@/server/pretix";

const eventsQuery = groq`*[_type == "event"]{
  _id,
  title,
  "slug": slug.current,
  pretixEventId,
  published,
  start,
  end,
  venue
} | order(start asc)`;

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [pretix, sanityEvents] = await Promise.all([
    getPretixEvents(),
    sanityClient.fetch(eventsQuery) as Promise<
      Array<{
        _id: string;
        title: string;
        slug: string;
        pretixEventId?: string;
        published?: boolean;
        start?: string;
        end?: string;
        venue?: string;
      }>
    >,
  ]);

  return NextResponse.json({
    pretix,
    events: sanityEvents,
  });
}
