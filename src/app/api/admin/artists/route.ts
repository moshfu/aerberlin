import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import groq from "groq";
import type { PortableTextBlock } from "sanity";
import { auth } from "@/lib/auth";
import { sanityClient, sanityWriteClient } from "@/lib/sanity.server";

const artistsQuery = groq`*[_type == "artist"] | order(name asc) {
  _id,
  name,
  role,
  tags,
  socials,
  bio
}`;

function portableTextToPlainText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks?.length) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) {
        return "";
      }
      return block.children
        .map((child) => ("text" in child ? child.text : ""))
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function plainTextToPortableText(text: string): PortableTextBlock[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return [];
  }

  return paragraphs.map((paragraph) => ({
    _type: "block",
    _key: randomUUID(),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: randomUUID(),
        text: paragraph,
        marks: [],
      },
    ],
  }));
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const artists = await sanityClient.fetch(artistsQuery);
  const payload = (artists as Array<Record<string, unknown>>).map((artist) => ({
    id: artist._id as string,
    name: artist.name as string,
    role: (artist.role as string | null) ?? "",
    tags: (artist.tags as string[] | null) ?? [],
    socials: (artist.socials as Record<string, string> | null) ?? {},
    bio: portableTextToPlainText(artist.bio as PortableTextBlock[] | undefined),
  }));

  return NextResponse.json({ artists: payload });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!sanityWriteClient) {
    return NextResponse.json(
      { message: "Sanity write client unavailable. Set SANITY_WRITE_TOKEN." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const { artistId, name, role, tags, socials, bio } = body ?? {};

  if (typeof artistId !== "string" || !artistId) {
    return NextResponse.json({ message: "Invalid artist id" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof name === "string") {
    update.name = name;
  }
  if (typeof role === "string") {
    update.role = role || null;
  }
  if (Array.isArray(tags)) {
    update.tags = tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  }
  if (socials && typeof socials === "object") {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(socials)) {
      if (typeof value === "string" && value.trim().length > 0) {
        normalized[key] = value.trim();
      }
    }
    update.socials = normalized;
  }
  if (typeof bio === "string") {
    update.bio = plainTextToPortableText(bio);
  }
  update.updatedAt = new Date().toISOString();

  await sanityWriteClient.patch(artistId).set(update).commit();

  return NextResponse.json({ success: true, artistId });
}
