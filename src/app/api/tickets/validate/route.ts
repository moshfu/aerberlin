import { NextResponse } from "next/server";
import { z } from "zod";
import { CheckInStatus } from "@prisma/client";
import { getEventBySlug } from "@/server/sanity";
import { scanPretixTicket } from "@/server/pretix";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { serverConfig } from "@/server/config";

const schema = z.object({
  code: z.string().min(3),
  eventSlug: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!serverConfig.useMockAuth) {
      if (!session?.user) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 });
      }
      if (!["ADMIN", "STAFF"].includes(session.user.role)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const rateLimitKey =
      session?.user?.id ?? session?.user?.email?.toLowerCase() ?? "anonymous-validator";
    const limitCheck = rateLimit(request, {
      limit: 30,
      windowMs: 60_000,
      keyPrefix: `tickets-validate:${rateLimitKey}`,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: "Too many validation attempts" },
        {
          status: 429,
          headers: { "Retry-After": String(limitCheck.retryAfter ?? 60) },
        },
      );
    }

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
      invalid: "invalid",
    };

    const reason = "reason" in pretixResponse ? pretixResponse.reason : undefined;
    const reasonExplanation =
      "reason_explanation" in pretixResponse ? pretixResponse.reason_explanation : undefined;

    const status = statusMap[pretixResponse.status] ?? (reason === "invalid" ? "invalid" : "error");
    const reasonMessage =
      reasonExplanation ||
      (reason === "already_redeemed"
        ? "Ticket already redeemed."
        : reason === "unpaid"
          ? "Ticket not paid."
          : reason === "invalid_time"
            ? "Ticket not valid at this time."
            : reason === "blocked"
              ? "Ticket blocked."
              : reason === "invalid"
                ? "Ticket not found."
                : null);
    const message =
      reasonMessage ??
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

    const attendee =
      ("position" in pretixResponse && pretixResponse.position?.attendee_name) ||
      (pretixResponse as { attendee?: string }).attendee ||
      (pretixResponse as { order?: string }).order;

    return NextResponse.json({
      status,
      attendee: attendee ?? undefined,
      event: event.title,
      message,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Validation failed" }, { status: 500 });
  }
}
