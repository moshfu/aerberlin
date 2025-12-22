import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverConfig } from "@/server/config";
import { verifyHmacSignature } from "@/lib/webhook-signature";

const PRETIX_SIGNATURE_HEADER = "x-pretix-signature";
const PRETIX_SIGNATURE_ALGORITHMS = ["sha256", "sha1"] as const;

export async function POST(request: Request) {
  const signatureHeader = request.headers.get(PRETIX_SIGNATURE_HEADER);
  const rawBody = await request.text();

  if (
    !signatureHeader ||
    !verifyHmacSignature({
      header: signatureHeader,
      payload: rawBody,
      secret: serverConfig.pretixWebhookSecret,
      algorithms: PRETIX_SIGNATURE_ALGORITHMS,
    })
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (!isPretixPayload(payload)) {
    return NextResponse.json({ message: "Unsupported payload" }, { status: 400 });
  }

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

type PretixPayload = {
  action?: string;
  order?: { code?: string; email?: string };
  checkin?: { lists?: Array<{ position?: string }>; position?: string };
  event?: string;
};

function isPretixPayload(payload: unknown): payload is PretixPayload {
  return typeof payload === "object" && payload !== null;
}
