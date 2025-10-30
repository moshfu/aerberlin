import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityWriteClient } from "@/lib/sanity.server";

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
  const { eventId, published } = body ?? {};

  if (typeof eventId !== "string" || typeof published !== "boolean") {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 },
    );
  }

  await sanityWriteClient.patch(eventId).set({ published }).commit();

  return NextResponse.json({ success: true, eventId, published });
}
