import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("x-sanity-signature");
  if (signature !== env.SANITY_PREVIEW_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const docType = body?.type;
  const slug = body?.slug;

  const locales = ["en", "de"];

  if (docType === "event" && slug) {
    locales.forEach((locale) => revalidatePath(`/${locale}/events/${slug}`));
  }
  if (docType === "artist" && slug) {
    locales.forEach((locale) => revalidatePath(`/${locale}/artists/${slug}`));
  }
  if (docType === "release" || docType === "event" || docType === "galleryItem") {
    locales.forEach((locale) => revalidatePath(`/${locale}`));
  }

  return NextResponse.json({ revalidated: true });
}
