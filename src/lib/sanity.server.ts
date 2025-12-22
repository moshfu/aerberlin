import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { serverConfig } from "@/server/config";

const apiVersion = serverConfig.sanityApiVersion;
const resolveValue = (value: string, fallback: string) =>
  /^[a-z0-9-]+$/i.test(value) ? value : fallback;

const projectId = resolveValue(serverConfig.sanityProjectId, "duyx7idq");
const dataset = resolveValue(serverConfig.sanityDataset, "production");

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: serverConfig.nodeEnv === "production",
  perspective: "published",
});

export const sanityWriteClient = serverConfig.sanityWriteToken
  ? sanityClient.withConfig({
      token: serverConfig.sanityWriteToken,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
    })
  : null;

const builder = imageUrlBuilder(sanityClient);

class LocalImageBuilder {
  constructor(private readonly urlValue: string) {}

  width() {
    return this;
  }

  height() {
    return this;
  }

  quality() {
    return this;
  }

  url() {
    return this.urlValue;
  }
}

function resolveLocalImage(source: Parameters<typeof builder.image>[0]) {
  const asset = (source as { asset?: { url?: string | null } })?.asset;
  if (!asset?.url) {
    return null;
  }

  const url = asset.url;
  const isRelativePath = !/^https?:\/\//.test(url);
  if (!isRelativePath) {
    return null;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  const localUrl = resolveLocalImage(source);
  if (localUrl) {
    return new LocalImageBuilder(localUrl);
  }
  return builder.image(source);
}
