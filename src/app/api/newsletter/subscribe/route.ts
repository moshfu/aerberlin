import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serverConfig } from "@/server/config";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const limitCheck = rateLimit(request, {
      limit: 5,
      windowMs: 60_000,
      keyPrefix: "newsletter",
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitCheck.retryAfter ?? 60),
          },
        },
      );
    }

    const body = await request.json();
    const { email, locale } = schema.parse(body);

    if (serverConfig.useMockAuth) {
      return NextResponse.json({ success: true });
    }

    if (serverConfig.buttondownApiKey && serverConfig.buttondownAudienceId) {
      await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${serverConfig.buttondownApiKey}`,
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
