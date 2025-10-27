import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { env } from "@/lib/env";

const apiVersion = env.SANITY_API_VERSION;
const resolveValue = (value: string, fallback: string) =>
  /^[a-z0-9-]+$/i.test(value) ? value : fallback;

const projectId = resolveValue(env.SANITY_PROJECT_ID, "demo-aerberlin");
const dataset = resolveValue(env.SANITY_DATASET, "production");

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: env.NODE_ENV === "production",
  perspective: "published",
});

export const sanityWriteClient = env.SANITY_WRITE_TOKEN
  ? sanityClient.withConfig({
      token: env.SANITY_WRITE_TOKEN,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
    })
  : null;

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
