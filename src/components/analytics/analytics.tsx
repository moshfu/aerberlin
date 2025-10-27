import Script from "next/script";
import { env } from "@/lib/env";

export function Analytics() {
  const plausibleEnabled = env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === "true" && env.PLAUSIBLE_DOMAIN;
  const gaEnabled = env.NEXT_PUBLIC_GA4_ENABLED === "true" && env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET;

  return (
    <>
      {plausibleEnabled ? (
        <Script
          defer
          data-domain={env.PLAUSIBLE_DOMAIN}
          src={env.PLAUSIBLE_DOMAIN?.includes("plausible")
            ? "https://plausible.io/js/script.tagged-events.js"
            : `${env.PLAUSIBLE_DOMAIN}/js/script.tagged-events.js`}
        />
      ) : null}
      {gaEnabled ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.GA4_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.GA4_MEASUREMENT_ID}', {
                anonymize_ip: true,
                cookieless_site: true
              });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
