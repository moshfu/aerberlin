import { getTranslations } from "next-intl/server";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

export default async function TermsPage() {
  const navT = await getTranslations("navigation");
  const page = await getPageBySlug("agb");
  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));
  return (
    <SubpageFrame
      title="Terms & Conditions"
      eyebrow="Legal"
      marqueeText="TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//"
      description={<p>Binding participation terms for all aer transmissions.</p>}
      navigation={navigation}
    >
      <div className="aer-panel">
        <PortableTextContent value={page?.body ?? []} className="aer-panel__content space-y-4 text-sm" />
      </div>
    </SubpageFrame>
  );
}
