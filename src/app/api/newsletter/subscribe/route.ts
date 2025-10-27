import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, locale } = schema.parse(body);

    if (env.USE_MOCK_AUTH === "true") {
      return NextResponse.json({ success: true });
    }

    if (env.BUTTONDOWN_API_KEY && env.BUTTONDOWN_AUDIENCE_ID) {
      await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          notes: "aer berlin website",
          tags: ["aerberlin"],
        }),
      });
    }

    await prisma.subscription.upsert({
      where: {
        email_source: {
          email,
          source: "WEBSITE",
        },
      },
      update: {
        status: "CONFIRMED",
        locale: locale ?? "en",
      },
      create: {
        email,
        status: "CONFIRMED",
        locale: locale ?? "en",
        source: "WEBSITE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Subscription failed" }, { status: 500 });
  }
}
