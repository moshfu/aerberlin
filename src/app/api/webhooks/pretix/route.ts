import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("x-pretix-signature");
  if (!signature || signature !== env.PRETIX_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const action = payload?.action;

  if (action === "order.created") {
    const orderCode: string | undefined = payload?.order?.code;
    const email: string | undefined = payload?.order?.email;
    if (orderCode) {
      await prisma.ticketOrder.updateMany({
        where: { pretixOrderCode: orderCode },
        data: {
          status: "COMPLETED",
          email,
          metadata: payload,
        },
      });
    }
  }

  if (action === "checkin.created") {
    await prisma.checkInLog.create({
      data: {
        ticketCode: payload?.checkin?.lists?.[0]?.position ?? payload?.checkin?.position ?? "",
        pretixEvent: payload?.event ?? "",
        status: "VALID",
        message: "Pretix check-in webhook",
        metadata: payload,
      },
    });
  }

  return NextResponse.json({ success: true });
}
