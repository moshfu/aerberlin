import { getTranslations } from "next-intl/server";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

export default async function PrivacyPage() {
  const navT = await getTranslations("navigation");
  const page = await getPageBySlug("datenschutz");
  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));
  return (
    <SubpageFrame
      title="Privacy Policy"
      eyebrow="Legal"
      marqueeText="PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//"
      description={<p>How we handle data, analytics and attendee privacy.</p>}
      navigation={navigation}
    >
      <div className="aer-panel">
        <PortableTextContent value={page?.body ?? []} className="aer-panel__content space-y-4 text-sm" />
      </div>
    </SubpageFrame>
  );
}
