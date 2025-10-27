import { getServerSession } from "next-auth";
import { env } from "@/lib/env";
import { authOptions } from "@/server/auth/options";

export async function auth() {
  if (env.USE_MOCK_AUTH === "true") {
    return null;
  }
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Auth disabled in development fallback", error);
      return null;
    }
    throw error;
  }
}
