import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getGalleryItems } from "@/server/sanity";
import { LightboxGallery } from "@/components/gallery/lightbox";
import { cn } from "@/lib/utils";
import { SubpageFrame } from "@/components/layout/subpage-frame";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [t] = await Promise.all([getTranslations("gallery")]);
  const items = await getGalleryItems();

  const tags = Array.from(new Set(items.flatMap((item) => item.tags ?? [])));
  const selectedTag = typeof params.tag === "string" ? params.tag : "all";
  const filtered = selectedTag === "all"
    ? items
    : items.filter((item) => item.tags?.includes(selectedTag));

  return (
    <SubpageFrame
      title={t("title")}
      description={<p>Nightscapes, strobes and analog film from the aer berlin orbit.</p>}
      marqueeText="GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//GALLERY//"
      actions={
        <nav className="aer-chipset" aria-label="Gallery filters">
          <FilterLink label={t("filter")} value="all" active={selectedTag === "all"} />
          {tags.map((tag) => (
            <FilterLink key={tag} label={`#${tag}`} value={tag} active={selectedTag === tag} />
          ))}
        </nav>
      }
      footnote={`${filtered.length} frames selected. Click to enter lightbox.`}
    >
      <div className="aer-panel">
        <LightboxGallery
          items={filtered
            .filter(
              (item): item is typeof item & { media: { _type: "image" } } =>
                item.media?._type === "image",
            )
            .map((item) => ({
              id: item._id,
              image: item.media,
              caption: item.caption,
              credit: item.credit,
            }))}
        />
      </div>
    </SubpageFrame>
  );
}

function FilterLink({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <Link
      href={{ pathname: "/gallery", query: { tag: value } }}
      className={cn("aer-nav-button aer-nav-button--compact", active && "is-active")}
    >
      {label}
    </Link>
  );
}
