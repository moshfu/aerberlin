import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { siteConfig } from "@/config/site";

export async function POST(request: Request) {
  const signature = request.headers.get("x-sanity-signature");
  if (signature !== env.SANITY_PREVIEW_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const docType = body?.type;
  const slug = body?.slug;

  const localePrefixes = siteConfig.locales.map((locale) =>
    locale === siteConfig.defaultLocale ? "" : `/${locale}`,
  );

  if (docType === "event" && slug) {
    localePrefixes.forEach((prefix) => revalidatePath(`${prefix}/events/${slug}`));
  }
  if (docType === "artist" && slug) {
    localePrefixes.forEach((prefix) => revalidatePath(`${prefix}/artists/${slug}`));
  }
  if (docType === "release" || docType === "event" || docType === "galleryItem") {
    localePrefixes.forEach((prefix) => revalidatePath(prefix === "" ? "/" : prefix));
  }

  return NextResponse.json({ revalidated: true });
}
