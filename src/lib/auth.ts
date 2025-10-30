import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";

export async function auth() {
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
