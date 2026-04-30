import {
  boostingCatalogRows,
  type BoostingNetwork,
  type BoostingPlatform,
  supportedServiceQuantities,
} from "./boosting-service-catalog.generated";
import { allGrowthPackages } from "./growth-packages";

import type {
  AccessPlan,
  Product,
  ServiceQuantity,
  ServiceReaction,
} from "./types";

export const accessPlans = ["one_year", "lifetime"] as const;
export const serviceQuantities = supportedServiceQuantities;
export const serviceReactionOptions = [
  { value: "like", label: "Like" },
  { value: "love", label: "Love" },
  { value: "care", label: "Care" },
  { value: "haha", label: "Haha" },
  { value: "wow", label: "Wow" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
] as const satisfies ReadonlyArray<{
  value: ServiceReaction;
  label: string;
}>;

export const boostingPlatformOptions = [
  {
    value: "youtube",
    label: "YouTube",
    description: "Subscribers, views, watch time, comments, and shares.",
    iconUrl: "/logos/youtube.svg",
  },
  {
    value: "meta",
    label: "Meta",
    description: "Facebook and Instagram services in one lane.",
    iconUrl: "/logos/meta.svg",
  },
  {
    value: "twitter-x",
    label: "Twitter / X",
    description: "Followers, likes, views, and comment-driven options.",
    iconUrl: "/logos/x.svg",
  },
  {
    value: "tiktok",
    label: "TikTok",
    description: "Followers, likes, shares, views, comments, and live support.",
    iconUrl: "/logos/tiktok.svg",
  },
  {
    value: "twitch",
    label: "Twitch",
    description: "Reserved for future Twitch growth packages.",
    iconUrl: "/logos/twitch.svg",
  },
  {
    value: "spotify",
    label: "Spotify",
    description: "Plays, saves, and audience growth for Spotify artists.",
    iconUrl: "/logos/spotify.png",
  },
  {
    value: "telegram",
    label: "Telegram",
    description: "Members, subscribers, reactions, comments, and views.",
    iconUrl: "/logos/telegram.svg",
  },
] as const satisfies ReadonlyArray<{
  value: BoostingPlatform;
  label: string;
  description: string;
  iconUrl: string;
}>;

export const boostingNetworkOptionsByPlatform = {
  meta: [
    {
      value: "facebook",
      label: "Facebook",
      description:
        "Followers, reactions, likes, comments, shares, views, and watch time.",
      iconUrl: "/logos/facebook.svg",
    },
    {
      value: "instagram",
      label: "Instagram",
      description: "Followers, likes, comments, shares, and views.",
      iconUrl: "/logos/instagram.svg",
    },
  ],
} as const satisfies Record<
  "meta",
  ReadonlyArray<{
    value: Extract<BoostingNetwork, "facebook" | "instagram">;
    label: string;
    description: string;
    iconUrl: string;
  }>
>;

type ServiceTargetConfig = {
  help: string;
  label: string;
  placeholder: string;
};

export type ServiceProductConfig = {
  category: string;
  deliveryTime: string;
  iconUrl: string | null;
  maxQuantity: number;
  minQuantity: number;
  network: BoostingNetwork | null;
  platform: BoostingPlatform;
  pricePerThousand: string;
  quantities: readonly ServiceQuantity[];
  requiresReaction?: boolean;
  serviceId: number;
  targetConfig: ServiceTargetConfig;
};

export const accessPlanLabels: Record<AccessPlan, string> = {
  one_month: "1 Month",
  three_months: "3 Months",
  six_months: "6 Months",
  one_year: "1 Year",
  two_years: "2 Years",
  lifetime: "Lifetime",
};

export type DurationConfig = {
  plan: AccessPlan;
  label: string;
  priceCalculator: (basePrice: number) => number;
};

export const durationConfigBySlug: Record<string, DurationConfig[]> = {
  "google-ai-pro": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base * 2 },
  ],
  "chatgpt-pro": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base * 2 },
  ],
  "chatgpt-go": [
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base },
  ],
  "chatgpt-renew-plus": [
    { plan: "one_month", label: "1 Month", priceCalculator: (base) => base },
  ],
  "perplexity-pro": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base * 2 },
  ],
  "capcut-shared": [
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base },
    { plan: "lifetime", label: "Lifetime", priceCalculator: (base) => base * 3 },
  ],
  "super-grok": [
    { plan: "one_month", label: "1 Month", priceCalculator: (base) => base },
  ],
  "super-grok-6m": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "claude-pro": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: () => 80 },
  ],
  "claude-max-5x": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: () => 550 },
  ],
  "claude-max-20x": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
    { plan: "one_year", label: "1 Year", priceCalculator: () => 1100 },
  ],
  "claude-team-standard": [
    { plan: "one_month", label: "1 Month", priceCalculator: (base) => base },
    { plan: "six_months", label: "6 Months", priceCalculator: () => 99 },
    { plan: "one_year", label: "1 Year", priceCalculator: () => 200 },
  ],
  "claude-team-premium": [
    { plan: "one_month", label: "1 Month", priceCalculator: (base) => base },
    { plan: "six_months", label: "6 Months", priceCalculator: () => 499 },
    { plan: "one_year", label: "1 Year", priceCalculator: () => 999 },
  ],
  "cursor-pro-presupplied": [
    { plan: "two_years", label: "2 Years", priceCalculator: (base) => base },
  ],
  "cursor-pro-own": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "cursor-pro-plus-own": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "cursor-ultra-own": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "jetbrains-edu": [
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base },
  ],
  "figma-edu": [
    { plan: "one_year", label: "1 Year", priceCalculator: (base) => base },
  ],
  "figma-pro": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "netflix": [
    { plan: "six_months", label: "6 Months", priceCalculator: (base) => base },
  ],
  "expressvpn-pro": [
    { plan: "one_month", label: "1 Month", priceCalculator: (base) => base },
  ],
  "pia-vpn": [
    { plan: "two_years", label: "2 Years", priceCalculator: (base) => base },
  ],
};

export const serviceReactionLabels: Record<ServiceReaction, string> = {
  like: "Like",
  love: "Love",
  care: "Care",
  haha: "Haha",
  wow: "Wow",
  sad: "Sad",
  angry: "Angry",
};

export const lifetimeUpgradeAmount = 2;

const targetConfigByNetwork: Record<BoostingNetwork, ServiceTargetConfig> = {
  facebook: {
    help: "Paste the public Facebook page, profile, post, reel, video, or group link for this service.",
    label: "Facebook Target URL",
    placeholder: "https://www.facebook.com/your-link",
  },
  instagram: {
    help: "Paste the Instagram profile, post, reel, or media link that should receive the service.",
    label: "Instagram Target URL",
    placeholder: "https://www.instagram.com/your-link",
  },
  telegram: {
    help: "Paste the Telegram channel, post, group, or invite link for this service.",
    label: "Telegram Target URL",
    placeholder: "https://t.me/your-link",
  },
  tiktok: {
    help: "Paste the TikTok profile, video, or live link that should receive the service.",
    label: "TikTok Target URL",
    placeholder: "https://www.tiktok.com/@your-link",
  },
  "twitter-x": {
    help: "Paste the X profile or post link that should receive the service.",
    label: "Twitter / X Target URL",
    placeholder: "https://x.com/your-link",
  },
  youtube: {
    help: "Paste the YouTube video, short, livestream, playlist, or channel link for this service.",
    label: "YouTube Target URL",
    placeholder: "https://www.youtube.com/watch?v=your-link",
  },
  spotify: {
    help: "Paste the Spotify track, album, or playlist link for this service.",
    label: "Spotify Target URL",
    placeholder: "https://open.spotify.com/track/your-link",
  },
};

const defaultTargetConfig: ServiceTargetConfig = {
  help: "Paste the public link that should receive this boosting service.",
  label: "Target URL",
  placeholder: "https://example.com/your-link",
};

const serviceProductConfigBySlug: Record<string, ServiceProductConfig> =
  Object.fromEntries(
    boostingCatalogRows.map((row) => {
      const [
        serviceId,
        platform,
        network,
        _name,
        slug,
        category,
        pricePerThousand,
        minQuantity,
        maxQuantity,
        deliveryTime,
        iconUrl,
      ] = row;

      return [
        slug,
        {
          category,
          deliveryTime,
          iconUrl,
          maxQuantity,
          minQuantity,
          network,
          platform,
          pricePerThousand,
          quantities: serviceQuantities.filter(
            (quantity) => quantity >= minQuantity && quantity <= maxQuantity,
          ),
          serviceId,
          targetConfig: network
            ? targetConfigByNetwork[network]
            : defaultTargetConfig,
        } satisfies ServiceProductConfig,
      ];
    }),
  );

export function normalizePrice(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return "0.00";
  }

  return amount.toFixed(2);
}

export function getProductDurationConfigs(slug: string): DurationConfig[] {
  return durationConfigBySlug[slug] ?? [];
}

export function getAccessPlanPrice(
  productOrSlug: Pick<Product, "slug" | "price"> | string,
  basePrice: string | number,
  accessPlan: AccessPlan,
) {
  const slug = typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;
  const amount = Number(normalizePrice(basePrice));
  
  const configs = durationConfigBySlug[slug];
  if (configs) {
    const config = configs.find(c => c.plan === accessPlan);
    if (config) {
      return normalizePrice(config.priceCalculator(amount));
    }
  }

  return normalizePrice(
    accessPlan === "lifetime" ? amount * 3 : amount,
  );
}

export function getAccessPlanLabel(accessPlan: AccessPlan) {
  return accessPlanLabels[accessPlan];
}

export function getAccessPlanPricingNote(slug: string, basePrice: string | number) {
  const configs = durationConfigBySlug[slug];
  if (configs && configs.length > 1) {
    return configs.map(c => `${c.label} ${getAccessPlanPrice(slug, basePrice, c.plan)}`).join(' · ');
  }
  return `${getAccessPlanLabel("one_year")} ${normalizePrice(basePrice)}`;
}

export function getServiceProductConfig(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  const slug =
    typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;

  return serviceProductConfigBySlug[slug] ?? null;
}

export function getBoostingPlatform(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  return getServiceProductConfig(productOrSlug)?.platform ?? null;
}

export function getBoostingNetwork(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  return getServiceProductConfig(productOrSlug)?.network ?? null;
}

export function getServiceTargetConfig(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  return (
    getServiceProductConfig(productOrSlug)?.targetConfig ?? defaultTargetConfig
  );
}

export function isServiceProduct(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  return getServiceProductConfig(productOrSlug) !== null;
}

export function isGrowthPackage(productOrSlug: Pick<Product, "slug"> | string) {
  const slug =
    typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;
  return allGrowthPackages.some((pkg) => pkg.slug === slug);
}

export function isAddonProduct(_productOrSlug: Pick<Product, "slug"> | string) {
  return false;
}

export function getProductSelectionMode(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  if (isGrowthPackage(productOrSlug)) return "package";
  if (isServiceProduct(productOrSlug)) return "service";
  return "subscription";
}

export function isValidServiceQuantity(
  productOrSlug: Pick<Product, "slug"> | string,
  quantity: number,
) {
  const config = getServiceProductConfig(productOrSlug);

  return config
    ? config.quantities.includes(quantity as ServiceQuantity)
    : false;
}

export function isValidServiceReaction(
  value: string | null | undefined,
): value is ServiceReaction {
  if (!value) {
    return false;
  }

  return serviceReactionOptions.some((option) => option.value === value);
}

export function getServiceReactionLabel(value: string | null | undefined) {
  return value && isValidServiceReaction(value)
    ? serviceReactionLabels[value]
    : "";
}

export function getServiceLinePrice(
  pricePerThousand: string | number,
  quantity: number,
) {
  return normalizePrice(
    (Number(normalizePrice(pricePerThousand)) / 1000) * quantity,
  );
}

export function getServiceProductPrice(
  productOrSlug: Pick<Product, "slug"> | string,
  quantity: number,
) {
  const config = getServiceProductConfig(productOrSlug);

  if (!config) {
    return "0.00";
  }

  return getServiceLinePrice(config.pricePerThousand, quantity);
}

export function getServiceStartingPrice(
  productOrSlug: Pick<Product, "slug"> | string,
) {
  const config = getServiceProductConfig(productOrSlug);

  if (!config) {
    return "0.00";
  }

  const firstQuantity = config.quantities[0];
  if (firstQuantity === undefined) {
    return "0.00";
  }

  return getServiceProductPrice(productOrSlug, firstQuantity);
}

export * from "./growth-packages";
