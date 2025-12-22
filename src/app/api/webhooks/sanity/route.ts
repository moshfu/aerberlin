import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverConfig } from "@/server/config";
import { siteConfig } from "@/config/site";
import { verifyHmacSignature } from "@/lib/webhook-signature";

const SANITY_SIGNATURE_HEADER = "x-sanity-signature";
const SANITY_SIGNATURE_ALGORITHMS = ["sha1", "sha256"] as const;

export async function POST(request: Request) {
  const signatureHeader = request.headers.get(SANITY_SIGNATURE_HEADER);
  const rawBody = await request.text();

  if (
    !signatureHeader ||
    !verifyHmacSignature({
      header: signatureHeader,
      payload: rawBody,
      secret: serverConfig.sanityPreviewSecret,
      algorithms: SANITY_SIGNATURE_ALGORITHMS,
    })
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { type?: string; slug?: string } | null = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

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
