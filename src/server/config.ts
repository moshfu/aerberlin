import { z } from "zod";

const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$/;

const booleanFromEnv = (value: string | undefined, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === "true";
};

const resolveAdminPasswordHash = () => {
  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH;
  }
  if (process.env.ADMIN_PASSWORD_HASH_BASE64) {
    try {
      return Buffer.from(process.env.ADMIN_PASSWORD_HASH_BASE64, "base64").toString("utf8");
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const serverConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("production"),

  databaseUrl: z.string().url(),
  sanityProjectId: z.string().min(1),
  sanityDataset: z.string().min(1),
  sanityApiVersion: z.string().min(1),
  sanityPreviewSecret: z.string().min(1),
  sanityWriteToken: z.string().min(1).optional(),

  pretixApiToken: z.string().min(1),
  pretixApiUrl: z.string().url(),
  pretixWebhookSecret: z.string().min(1),
  pretixCheckinListId: z.string().min(1),
  pretixOrganizerSlug: z.string().min(1),
  pretixEventSeriesSlug: z.string().optional(),

  stripeSecretKey: z.string().min(1),
  stripeWebhookSecret: z.string().min(1),

  nextAuthSecret: z.string().min(1),
  nextPublicAppUrl: z.string().url(),

  emailServerHost: z.string().min(1),
  emailServerPort: z.coerce.number(),
  emailServerUser: z.string().min(1),
  emailServerPassword: z.string().min(1),

  buttondownApiKey: z.string().optional(),
  buttondownAudienceId: z.string().optional(),
  mailchimpApiKey: z.string().optional(),
  mailchimpServerPrefix: z.string().optional(),
  plausibleDomain: z.string().optional(),
  ga4MeasurementId: z.string().optional(),
  ga4ApiSecret: z.string().optional(),

  useMockSanity: z.boolean(),
  useMockPretix: z.boolean(),
  useMockStripe: z.boolean(),
  useMockAuth: z.boolean(),

  adminEmail: z.string().email(),
  adminPasswordHash: z
    .string()
    .regex(BCRYPT_REGEX, "ADMIN_PASSWORD_HASH must be a bcrypt hash starting with $2"),

  previewUser: z.string().optional(),
  previewPass: z.string().optional(),
});

export const serverConfig = serverConfigSchema.parse({
  nodeEnv: process.env.NODE_ENV ?? "production",

  databaseUrl: process.env.DATABASE_URL,
  sanityProjectId: process.env.SANITY_PROJECT_ID,
  sanityDataset: process.env.SANITY_DATASET,
  sanityApiVersion: process.env.SANITY_API_VERSION,
  sanityPreviewSecret: process.env.SANITY_PREVIEW_SECRET,
  sanityWriteToken: process.env.SANITY_WRITE_TOKEN,

  pretixApiToken: process.env.PRETIX_API_TOKEN,
  pretixApiUrl: process.env.PRETIX_API_URL,
  pretixWebhookSecret: process.env.PRETIX_WEBHOOK_SECRET,
  pretixCheckinListId: process.env.PRETIX_CHECKIN_LIST_ID,
  pretixOrganizerSlug: process.env.PRETIX_ORGANIZER_SLUG,
  pretixEventSeriesSlug: process.env.PRETIX_EVENT_SERIES_SLUG,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://aerberlin.de",

  emailServerHost: process.env.EMAIL_SERVER_HOST,
  emailServerPort: process.env.EMAIL_SERVER_PORT,
  emailServerUser: process.env.EMAIL_SERVER_USER,
  emailServerPassword: process.env.EMAIL_SERVER_PASSWORD,

  buttondownApiKey: process.env.BUTTONDOWN_API_KEY,
  buttondownAudienceId: process.env.BUTTONDOWN_AUDIENCE_ID,
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
  mailchimpServerPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
  plausibleDomain: process.env.PLAUSIBLE_DOMAIN,
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID,
  ga4ApiSecret: process.env.GA4_API_SECRET,

  useMockSanity: booleanFromEnv(process.env.USE_MOCK_SANITY, true),
  useMockPretix: booleanFromEnv(process.env.USE_MOCK_PRETIX, true),
  useMockStripe: booleanFromEnv(process.env.USE_MOCK_STRIPE, true),
  useMockAuth: booleanFromEnv(process.env.USE_MOCK_AUTH, true),

  adminEmail: process.env.ADMIN_EMAIL,
  adminPasswordHash: resolveAdminPasswordHash(),

  previewUser: process.env.PREVIEW_USER,
  previewPass: process.env.PREVIEW_PASS,
});

export type ServerConfig = typeof serverConfig;
