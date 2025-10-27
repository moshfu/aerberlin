import { createNavigation } from "next-intl/navigation";
import { i18nConfig } from "./config";

export const locales = i18nConfig.locales;
export const defaultLocale = i18nConfig.defaultLocale;

const navigation = createNavigation({
  locales,
  defaultLocale,
  localePrefix: i18nConfig.localePrefix,
});

export const { Link, usePathname, useRouter, redirect, getPathname } = navigation;
