import { NextResponse } from "next/server";
import { z } from "zod";
import { CheckInStatus } from "@prisma/client";
import { getEventBySlug } from "@/server/sanity";
import { scanPretixTicket } from "@/server/pretix";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(3),
  eventSlug: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, eventSlug } = schema.parse(body);

    const event = await getEventBySlug(eventSlug);
    if (!event || !event.pretixEventId) {
      return NextResponse.json({ message: "Event not configured" }, { status: 400 });
    }

    const pretixResponse = await scanPretixTicket(event.pretixEventId, code);

    const statusMap: Record<string, "valid" | "invalid" | "used" | "error"> = {
      ok: "valid",
      already_redeemed: "used",
      error: "error",
    };

    const status = statusMap[pretixResponse.status] ?? "invalid";
    const message = pretixResponse.reason ??
      (status === "valid"
        ? "Ticket redeemed. Enjoy the night."
        : status === "used"
          ? "Ticket already redeemed."
          : status === "error"
            ? "Pretix rejected the scan."
            : "Ticket not found.");

    const logStatus: Record<typeof status, CheckInStatus> = {
      valid: "VALID",
      used: "USED",
      invalid: "INVALID",
      error: "ERROR",
    };

    await prisma.checkInLog.create({
      data: {
        ticketCode: code,
        pretixEvent: event.pretixEventId,
        status: logStatus[status],
        message,
        metadata: pretixResponse,
      },
    });

    return NextResponse.json({
      status,
      attendee: pretixResponse.attendee ?? pretixResponse.order ?? undefined,
      event: event.title,
      message,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Validation failed" }, { status: 500 });
  }
}
