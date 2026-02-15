import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

// Redirect bare domain to the default locale so visiting "/" never 404s.
export default function RootRedirect() {
  redirect(`/${siteConfig.defaultLocale}`);
}
