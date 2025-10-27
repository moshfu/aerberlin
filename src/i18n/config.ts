import { siteConfig } from "@/config/site";

export const i18nConfig = {
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: "always" as const,
};
