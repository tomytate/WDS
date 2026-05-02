import { useDeferredValue, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { AccessPlan, Product } from "@wongdigital/db";
import {
  boostingNetworkOptionsByPlatform,
  boostingPlatformOptions,
  getBoostingNetwork,
  getBoostingPlatform,
  getProductSelectionMode,
  getServiceProductConfig,
  serviceReactionOptions,
  getProductDurationConfigs,
  BULK_ORDER_CONTACT_THRESHOLD,
} from "@wongdigital/db/pricing";
import { Badge, buttonStyles } from "@wongdigital/ui";

import { isVisibleCatalogProduct } from "@/lib/catalog";
import { formatQuantity, formatOrderItemMeta } from "@/lib/format";
import { ProductLogo } from "@/components/product-logo";
import { getProductSummary, getProductDetails } from "@/lib/product-copy";
import { ProductDetailBlock } from "./product-detail-block";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import type { OrderFormValues, OrderSelectionValue } from "@/lib/schemas";
import type { StoreRuntimeFlags } from "@/lib/vercel/edge-config";
import type { SelectedCartItem } from "./cart-summary";

const browseModeOptions = [
  {
    value: "digital",
    label: "Original Products",
    description:
      "ChatGPT Pro, Canva Pro, Spotify Premium, Grammarly Plus, and the rest of your digital catalog.",
  },
  {
    value: "boosting",
    label: "Boosting Services",
    description:
      "Browse Meta, YouTube, TikTok, Twitter / X, and Telegram services through a cleaner platform-first flow.",
  },
] as const;

type BrowseMode = (typeof browseModeOptions)[number]["value"];

/* ─── Brand Tile Definitions ─── */
const digitalBrands = [
  { id: "chatgpt", label: "ChatGPT", iconUrl: "/logos/chatgpt.svg", category: "ai-dev", matchSlugs: ["chatgpt-go", "chatgpt-pro", "chatgpt-renew-plus"] },
  { id: "google-ai", label: "Google AI", iconUrl: "/logos/gemini.svg", category: "ai-dev", matchSlugs: ["google-ai-pro"] },
  { id: "perplexity", label: "Perplexity", iconUrl: "/logos/perplexity.svg", category: "ai-dev", matchSlugs: ["perplexity-pro"] },
  { id: "super-grok", label: "Super Grok", iconUrl: "/logos/grok.svg", category: "ai-dev", matchSlugs: ["super-grok", "super-grok-6m"] },
  { id: "claude", label: "Claude", iconUrl: "/logos/claude.svg", category: "ai-dev", matchSlugs: ["claude-pro", "claude-max-5x", "claude-max-20x", "claude-team-standard", "claude-team-premium"] },
  { id: "cursor", label: "Cursor", iconUrl: "/logos/cursor.svg", category: "ai-dev", matchSlugs: ["cursor-pro-own", "cursor-pro-plus-own", "cursor-ultra-own", "cursor-pro-presupplied"] },
  { id: "jetbrains", label: "JetBrains", iconUrl: "/logos/jetbrains.svg", category: "ai-dev", matchSlugs: ["jetbrains-edu"] },
  { id: "figma", label: "Figma", iconUrl: "/logos/figma.svg", category: "ai-dev", matchSlugs: ["figma-edu", "figma-pro"] },
  { id: "netflix", label: "Netflix", iconUrl: "/logos/netflix.svg", category: "streaming-vpn", matchSlugs: ["netflix"] },
  { id: "capcut", label: "CapCut", iconUrl: "/logos/capcut.svg", category: "streaming-vpn", matchSlugs: ["capcut-shared"] },
  { id: "expressvpn", label: "ExpressVPN", iconUrl: "/logos/expressvpn.svg", category: "streaming-vpn", matchSlugs: ["expressvpn-pro"] },
  { id: "pia", label: "PIA VPN", iconUrl: "/logos/pia.svg", category: "streaming-vpn", matchSlugs: ["pia-vpn"] },
];

const brandCategories = [
  { id: "ai-dev", label: "AI & Dev Tools" },
  { id: "streaming-vpn", label: "Streaming & VPN" },
] as const;
type BoostingPlatform = (typeof boostingPlatformOptions)[number]["value"];
type MetaBoostingNetwork =
  (typeof boostingNetworkOptionsByPlatform.meta)[number]["value"];

const boostingServiceTypeOrder = [
  "Followers",
  "Subscribers",
  "Members",
  "Group Members",
  "Likes",
  "Comments",
  "Reactions",
  "Shares",
  "Views",
  "Live Stream Views",
  "Watch Time",
  "More Services",
] as const;


function getBoostingServiceType(product: Product) {
  const normalizedName = product.name.trim();

  if (/watch time/i.test(normalizedName)) return "Watch Time";
  if (/live stream views/i.test(normalizedName)) return "Live Stream Views";
  if (/group members/i.test(normalizedName)) return "Group Members";
  if (/reaction/i.test(normalizedName)) return "Reactions";
  if (/comment/i.test(normalizedName)) return "Comments";
  if (/share/i.test(normalizedName)) return "Shares";
  if (/subscriber/i.test(normalizedName)) return "Subscribers";
  if (/member/i.test(normalizedName)) return "Members";
  if (/follower/i.test(normalizedName)) return "Followers";
  if (/like/i.test(normalizedName)) return "Likes";
  if (/view|play/i.test(normalizedName)) return "Views";

  return "More Services";
}

import {
  youtubeMonetizationPackages,
  premiumGrowthPackages,
  botGrowthPackages,
} from "@wongdigital/db/pricing";

// ─── Display Name Cleanup ───────────────────────────────────────────────────

/** Strips confusing technical jargon from catalog names for customer display */
function cleanDisplayName(rawName: string): string {
  let name = rawName;

  // Remove platform prefix since it's already shown in the UI context
  // e.g. "Facebook Followers (Premium)" → "Followers (Premium)" when inside Facebook section
  const platformPrefixes = [
    "Facebook ",
    "Instagram ",
    "TikTok ",
    "Twitter/X ",
    "YouTube ",
    "Telegram ",
  ];
  for (const prefix of platformPrefixes) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }

  // Clean up confusing quality/delivery labels
  name = name.replace(/\(Standard,?\s*/g, "(Basic, ");
  name = name.replace(/\(Low Quality,?\s*/g, "(Basic, ");
  name = name.replace(/\(High Quality,?\s*/g, "(Premium, ");
  name = name.replace(/\(Aged Accounts\)/g, "(Established Profiles)");
  name = name.replace(/\(Active Aged Accounts,?\s*/g, "(Active Profiles, ");
  name = name.replace(/\(Active Aged Accounts\)/g, "(Active Profiles)");
  name = name.replace(/\(Aged Accounts,?\s*/g, "(Established Profiles, ");
  name = name.replace(/\(AI Sustained\)/g, "(Auto-Maintained)");
  name = name.replace(/ \(Global\)/g, "");
  name = name.replace(/\(Global,?\s*/g, "(");
  name = name.replace(/\(Hidden Data\)/g, "(Bot)");
  name = name.replace(/\(Automated\)/g, "(Auto)");
  name = name.replace(/ - /g, " ");

  // Remove "(Basic, )" artifacts from cleanup
  name = name.replace(/\(Basic, \)/g, "(Basic)");
  name = name.replace(/\(Premium, \)/g, "(Premium)");
  name = name.replace(/\(Established Profiles, \)/g, "(Established Profiles)");
  name = name.replace(/\(Active Profiles, \)/g, "(Active Profiles)");
  name = name.replace(/\(, /g, "(");

  return name.trim();
}

function sortBoostingServiceTypes(left: string, right: string) {
  const leftIndex = boostingServiceTypeOrder.indexOf(
    left as (typeof boostingServiceTypeOrder)[number],
  );
  const rightIndex = boostingServiceTypeOrder.indexOf(
    right as (typeof boostingServiceTypeOrder)[number],
  );

  if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
  if (leftIndex === -1) return 1;
  if (rightIndex === -1) return -1;
  return leftIndex - rightIndex;
}


export function createDefaultOrderItem(product: Product): OrderSelectionValue {
  const selectionMode = getProductSelectionMode(product);

  if (selectionMode === "service") {
    const config = getServiceProductConfig(product);

    return {
      productId: product.id,
      accessPlan: "one_year",
      quantity: config?.quantities[0] ?? 100,
      serviceOption: config?.requiresReaction
        ? (serviceReactionOptions[0]?.value ?? "like")
        : "",
      targetUrl: "",
    };
  }

  const durationConfigs = getProductDurationConfigs(product.slug);
  const defaultDigitalPlan: AccessPlan =
    durationConfigs[0]?.plan ?? "one_year";

  return {
    productId: product.id,
    accessPlan: defaultDigitalPlan,
    targetUrl: "",
  };
}

export type ProductSelectionStepProps = {
  products: Product[];
  selectedProductId?: string;
  storeFlags: StoreRuntimeFlags;
  selectedCartItems: SelectedCartItem[];
  setClearPending?: (clear: boolean) => void;
};

export function ProductSelectionStep({
  products,
  selectedProductId,
  storeFlags,
  selectedCartItems,
  setClearPending,
}: ProductSelectionStepProps) {
  const form = useFormContext<OrderFormValues>();
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary } = useGeoPricing();
  const preselectedProduct = selectedProductId
    ? (products.find((product) => product.id === selectedProductId) ?? null)
    : null;

  const canBrowseBoosting = storeFlags.boostingEnabled;
  const availableBrowseModeOptions = canBrowseBoosting
    ? browseModeOptions
    : browseModeOptions.filter((option) => option.value === "digital");

  const [browseMode, setBrowseMode] = useState<BrowseMode>(
    preselectedProduct &&
      getProductSelectionMode(preselectedProduct) === "service" &&
      canBrowseBoosting
      ? "boosting"
      : "digital",
  );
  const [boostingPlatform, setBoostingPlatform] = useState<BoostingPlatform>(
    preselectedProduct &&
      getProductSelectionMode(preselectedProduct) === "service"
      ? (getBoostingPlatform(preselectedProduct) ?? "meta")
      : "meta",
  );
  const [boostingNetwork, setBoostingNetwork] = useState<MetaBoostingNetwork>(
    preselectedProduct &&
      getProductSelectionMode(preselectedProduct) === "service"
      ? ((getBoostingNetwork(
          preselectedProduct,
        ) as MetaBoostingNetwork | null) ?? "facebook")
      : "facebook",
  );
  const [boostingServiceType, setBoostingServiceType] = useState(
    preselectedProduct &&
      getProductSelectionMode(preselectedProduct) === "service"
      ? getBoostingServiceType(preselectedProduct)
      : "",
  );
  const [boostingServiceQuery, setBoostingServiceQuery] = useState("");
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [focusedProductSlug, setFocusedProductSlug] = useState<string | null>(null);

  const deferredBoostingServiceQuery = useDeferredValue(boostingServiceQuery);
  const normalizedBoostingServiceQuery = deferredBoostingServiceQuery
    .trim()
    .toLowerCase();
  const storefrontProducts = products.filter(isVisibleCatalogProduct);
  const subscriptionProducts = storefrontProducts.filter(
    (product) => getProductSelectionMode(product) === "subscription",
  );
  const boostingProducts = storefrontProducts.filter(
    (product) => getProductSelectionMode(product) === "service",
  );

  const availableBoostingPlatforms = useMemo(() => new Set(
    boostingProducts
      .map((product) => getBoostingPlatform(product))
      .filter((platform): platform is BoostingPlatform => platform !== null),
  ), [boostingProducts]);
  const availableBoostingNetworks = useMemo(() => new Set(
    boostingProducts
      .filter((product) => getBoostingPlatform(product) === "meta")
      .map((product) => getBoostingNetwork(product))
      .filter(
        (network): network is MetaBoostingNetwork =>
          network === "facebook" || network === "instagram",
      ),
  ), [boostingProducts]);

  const scopedBoostingProducts = boostingProducts.filter((product) => {
    const productPlatform = getBoostingPlatform(product);
    const productNetwork = getBoostingNetwork(product);

    if (productPlatform !== boostingPlatform) return false;
    if (
      boostingPlatform === "meta" &&
      boostingNetwork &&
      productNetwork !== boostingNetwork
    )
      return false;

    return true;
  });

  const availableBoostingServiceTypes = Array.from(
    new Set(scopedBoostingProducts.map(getBoostingServiceType)),
  ).sort(sortBoostingServiceTypes);

  const visibleProducts =
    browseMode === "digital"
      ? subscriptionProducts
      : scopedBoostingProducts.filter((product) => {
          if (
            !boostingServiceType ||
            getBoostingServiceType(product) !== boostingServiceType
          )
            return false;
          return normalizedBoostingServiceQuery.length === 0
            ? true
            : product.name
                .toLowerCase()
                .includes(normalizedBoostingServiceQuery);
        });

  useEffect(() => {
    if (canBrowseBoosting || browseMode !== "boosting") return;
    setBrowseMode("digital");
  }, [browseMode, canBrowseBoosting]);

  useEffect(() => {
    if (browseMode !== "boosting") return;
    if (!availableBoostingPlatforms.has(boostingPlatform)) {
      const fallbackPlatform = boostingPlatformOptions.find((platform) =>
        availableBoostingPlatforms.has(platform.value),
      );
      if (fallbackPlatform) setBoostingPlatform(fallbackPlatform.value);
    }
  }, [availableBoostingPlatforms, boostingPlatform, browseMode]);

  useEffect(() => {
    if (browseMode !== "boosting" || boostingPlatform !== "meta") return;
    if (!availableBoostingNetworks.has(boostingNetwork)) {
      const fallbackNetwork = boostingNetworkOptionsByPlatform.meta.find(
        (network) => availableBoostingNetworks.has(network.value),
      );
      if (fallbackNetwork) setBoostingNetwork(fallbackNetwork.value);
    }
  }, [
    availableBoostingNetworks,
    boostingNetwork,
    boostingPlatform,
    browseMode,
  ]);

  useEffect(() => {
    if (browseMode !== "boosting") return;
    if (
      boostingServiceType &&
      !availableBoostingServiceTypes.some(
        (serviceType) => serviceType === boostingServiceType,
      )
    ) {
      setBoostingServiceType("");
    }
  }, [availableBoostingServiceTypes, boostingServiceType, browseMode]);

  function setItems(nextItems: OrderSelectionValue[]) {
    if (nextItems.length === 0 && setClearPending) {
      setClearPending(false);
    }
    form.setValue("items", nextItems, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.clearErrors("items");
  }

  function toggleProduct(product: Product) {
    const currentItems = form.getValues("items");
    const hasProduct = currentItems.some(
      (item) => item.productId === product.id,
    );
    const nextItems = hasProduct
      ? currentItems.filter((item) => item.productId !== product.id)
      : [...currentItems, createDefaultOrderItem(product)];
    setItems(nextItems);

    // Auto-clear bundle if a normal product is toggled
    const currentBundle = form.getValues("bundleId");
    if (currentBundle) {
      form.setValue("bundleId", "");
    }
  }


  function updateProductItem(
    productId: string,
    updates: Partial<OrderSelectionValue>,
  ) {
    const currentItems = form.getValues("items");
    const nextItems = currentItems.map((item) =>
      item.productId === productId ? { ...item, ...updates } : item,
    );
    setItems(nextItems);
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      <div className="grid gap-2.5 sm:gap-4 lg:grid-cols-2">
        {availableBrowseModeOptions.map((option) => {
          const active = browseMode === option.value;

          return (
            <button
              className={`glow-ring rounded-[--radius-card] border p-3.5 sm:p-5 text-left transition-all duration-200 ${
                active
                  ? "border-[--text-primary] bg-[--bg-surface]"
                  : "border-[--border] bg-[--bg-card] hover:bg-[--bg-surface] active:scale-[0.99]"
              }`}
              key={option.value}
              onClick={() => {
                setBrowseMode(option.value);

                if (option.value === "digital") {
                  setBoostingServiceQuery("");
                  setBoostingServiceType("");
                }
              }}
              type="button"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg sm:text-xl lg:text-[28px] leading-[0.95] tracking-tight text-[--text-primary]">
                    {option.label}
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed sm:leading-7 text-[--text-secondary] line-clamp-2 sm:line-clamp-none">
                    {option.description}
                  </p>
                </div>
                <Badge
                  tone={active ? "accent" : "muted"}
                  className="shrink-0 text-[10px] sm:text-xs"
                >
                  {active ? "Selected" : "Browse"}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {browseMode === "boosting" ? (
        <>
          {/* Growth Packages Section */}
          <div className="space-y-4 rounded-[--radius-card] border border-[--text-primary] bg-[--bg-card] p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] bg-[--accent] text-[--accent-fg]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-display text-xl tracking-tight sm:text-2xl">
                  Growth Packages
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[--text-secondary]">
                  Pre-made bundles of Followers + Likes at discounted package
                  prices.
                </p>
              </div>
            </div>

            {/* ── YouTube Monetization Packages (Premium · Real & Active) ── */}
            <div className="space-y-4 rounded-xl border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_4%,var(--bg-card))] p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <ProductLogo
                  iconUrl={youtubeMonetizationPackages.iconUrl}
                  name="YouTube"
                  size="sm"
                />
                <div>
                  <p className="font-display text-lg tracking-tight sm:text-xl">
                    YouTube Monetization Plan
                  </p>
                  <p className="text-[10px] sm:text-xs text-[--text-secondary]">
                    Guaranteed path to YouTube Partner Program eligibility
                  </p>
                </div>
              </div>

              {/* Real & Active disclaimer */}
              <div className="flex items-start gap-2.5 rounded-xl border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3.5 py-3">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[--color-success]"
                />
                <p className="text-xs leading-relaxed text-[--text-secondary]">
                  <span className="font-semibold text-[--color-success]">
                    Real & Active quality.
                  </span>{" "}
                  100% real Filipino accounts. Geo-targeted PH traffic. Views
                  are monetizable and engagement-positive. Ratio: 1 Subscriber :
                  1 View : 5 Likes.
                </p>
              </div>

              <div className="space-y-2">
                {youtubeMonetizationPackages.packages.map((pkg) => {
                  const match = products.find((p) => p.slug === pkg.slug);
                  const inCart = match
                    ? selectedCartItems.some(
                        (item) => item.productId === match.id,
                      )
                    : false;

                  return (
                    <button
                      key={pkg.slug}
                      onClick={() => {
                        if (match) toggleProduct(match);
                      }}
                      type="button"
                      className={`flex text-left w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors hover:border-[color-mix(in_srgb,var(--color-success)_40%,var(--border))] ${inCart ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] shadow-[0_0_8px_color-mix(in_srgb,var(--color-success)_10%,transparent)]" : "border-[color-mix(in_srgb,var(--color-success)_20%,var(--border))] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)]"}`}
                    >
                      <div className="min-w-0 flex-1">
                        {pkg.tierName ? (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-success] mb-0.5">
                            {pkg.tierName}
                          </p>
                        ) : null}
                        <p className="font-medium text-[--text-primary]">
                          {formatQuantity(
                            pkg.subscribers || pkg.followers || 0,
                          )}{" "}
                          Subs + {formatQuantity(pkg.views || 0)} Views +{" "}
                          {formatQuantity(pkg.likes)} Likes
                        </p>
                        {pkg.savings ? (
                          <p className="mt-0.5 text-[10px] font-semibold text-[--color-success]">
                            Save {formatPrimaryPrice(pkg.savings, pkg.slug)}
                            {showSecondary && (
                              <span className="opacity-75"> (≈ {formatSecondaryPrice(pkg.savings)})</span>
                            )}
                          </p>
                        ) : null}
                      </div>
                      {inCart ? (
                        <span className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[--color-success] px-2.5 py-1 font-semibold text-[--bg-surface]">
                          <Check size={12} strokeWidth={3} />
                          In Cart
                        </span>
                      ) : (
                        <span className="shrink-0 flex flex-col items-end rounded-lg bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-2.5 py-1 text-right text-[--color-success]">
                          <span className="font-bold leading-[1.1]">{formatPrimaryPrice(pkg.price, pkg.slug)}</span>
                          {showSecondary && (
                            <span className="text-[9px] font-semibold opacity-75 leading-[1.1] mt-0.5">
                              ≈ {formatSecondaryPrice(pkg.price)}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Premium Quality Packages (Seller Grade · High Quality) ── */}
            <div className="space-y-4 rounded-xl border border-[--color-info] bg-[color-mix(in_srgb,var(--color-info)_4%,var(--bg-card))] p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <Sparkles size={24} className="text-[--color-info]" />
                <div>
                  <p className="font-display text-lg tracking-tight sm:text-xl">
                    Premium Packages{" "}
                    <span className="text-[--color-info]">· Seller Grade</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-[--text-secondary]">
                    High-quality accounts for sellers &amp; live sellers
                  </p>
                </div>
              </div>

              {/* High quality disclaimer */}
              <div className="flex items-start gap-2.5 rounded-xl border border-[--color-info] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] px-3.5 py-3">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[--color-info]"
                />
                <p className="text-xs leading-relaxed text-[--text-secondary]">
                  <span className="font-semibold text-[--color-info]">
                    High-quality accounts.
                  </span>{" "}
                  These are premium followers ideal for sellers and live
                  sellers. Great for building credibility, boosting live viewer
                  counts, and attracting real buyers.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {premiumGrowthPackages.map((platformPkg) => (
                  <div
                    key={platformPkg.platform}
                    className="space-y-3 rounded-xl border border-[--border] bg-[--bg-card] p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <ProductLogo
                        iconUrl={platformPkg.iconUrl}
                        name={platformPkg.platform}
                        size="sm"
                      />
                      <p className="font-display text-lg tracking-tight">
                        {platformPkg.platform}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {platformPkg.packages.map((pkg) => {
                        const match = products.find((p) => p.slug === pkg.slug);
                        const inCart = match
                          ? selectedCartItems.some(
                              (item) => item.productId === match.id,
                            )
                          : false;

                        return (
                          <button
                            key={pkg.slug}
                            onClick={() => {
                              if (match) toggleProduct(match);
                            }}
                            type="button"
                            className={`flex text-left w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors hover:border-[color-mix(in_srgb,var(--color-info)_40%,var(--border))] ${inCart ? "border-[--color-info] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] shadow-[0_0_8px_color-mix(in_srgb,var(--color-info)_10%,transparent)]" : "border-[color-mix(in_srgb,var(--color-info)_20%,var(--border))] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)]"}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[--text-primary]">
                                {platformPkg.platform === "Telegram" ? (
                                  <>{formatQuantity(pkg.subscribers!)} Members + {formatQuantity(pkg.likes)} Reactions</>
                                ) : (
                                  <>{formatQuantity(pkg.followers!)} Followers + {formatQuantity(pkg.likes)} Likes</>
                                )}
                              </p>
                              {pkg.savings ? (
                                <p className="mt-0.5 text-[10px] font-semibold text-[--color-success]">
                                  Save {formatPrimaryPrice(pkg.savings, pkg.slug)}
                                  {showSecondary && (
                                    <span className="opacity-75"> (≈ {formatSecondaryPrice(pkg.savings)})</span>
                                  )}
                                </p>
                              ) : null}
                            </div>
                            {inCart ? (
                              <span className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[--color-info] px-2.5 py-1 font-semibold text-[--bg-surface]">
                                <Check size={12} strokeWidth={3} />
                                In Cart
                              </span>
                            ) : (
                              <span className="shrink-0 flex flex-col items-end rounded-lg bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] px-2.5 py-1 text-right text-[--color-info]">
                                <span className="font-bold leading-[1.1]">{formatPrimaryPrice(pkg.price, pkg.slug)}</span>
                                {showSecondary && (
                                  <span className="text-[9px] font-semibold opacity-75 leading-[1.1] mt-0.5">
                                    ≈ {formatSecondaryPrice(pkg.price)}
                                  </span>
                                )}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bot-Quality Social Growth Packages (FB / IG / TikTok) ── */}
            {/* Bot quality disclaimer */}
            <div className="flex items-start gap-2.5 rounded-xl border border-[--color-warning] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-3.5 py-3">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-[--color-warning]"
              />
              <p className="text-xs leading-relaxed text-[--text-secondary]">
                <span className="font-semibold text-[--color-warning]">
                  Bot quality.
                </span>{" "}
                Growth packages below use bot-generated engagement. They
                increase numbers quickly but may not reflect real user activity.
                Best for social proof and initial growth.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {botGrowthPackages.map((platformPkg) => (
                <div
                  key={platformPkg.platform}
                  className="space-y-3 rounded-xl border border-[--border] bg-[--bg-card] p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <ProductLogo
                      iconUrl={platformPkg.iconUrl}
                      name={platformPkg.platform}
                      size="sm"
                    />
                    <p className="font-display text-lg tracking-tight">
                      {platformPkg.platform}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {platformPkg.packages.map((pkg) => {
                      const match = products.find((p) => p.slug === pkg.slug);
                      const inCart = match
                        ? selectedCartItems.some(
                            (item) => item.productId === match.id,
                          )
                        : false;

                      return (
                        <button
                          key={pkg.slug}
                          onClick={() => {
                            if (match) toggleProduct(match);
                          }}
                          type="button"
                          className={`flex text-left w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors hover:border-[--accent-border] ${inCart ? "border-[--text-primary] bg-[--bg-surface]" : "border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)]"}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[--text-primary]">
                              {platformPkg.platform === "YouTube" ? (
                                <>
                                  {formatQuantity(pkg.subscribers!)} Subs +{" "}
                                  {formatQuantity(pkg.views!)} Views +{" "}
                                  {formatQuantity(pkg.likes)} Likes
                                </>
                              ) : platformPkg.platform === "Telegram" ? (
                                <>{formatQuantity(pkg.subscribers!)} Members</>
                              ) : (
                                <>{formatQuantity(pkg.followers!)} Followers + {formatQuantity(pkg.likes)} Likes</>
                              )}
                            </p>
                            {pkg.savings ? (
                              <p className="mt-0.5 text-[10px] font-semibold text-[--color-success]">
                                Save {formatPrimaryPrice(pkg.savings, pkg.slug)}
                                {showSecondary && (
                                  <span className="opacity-75"> (≈ {formatSecondaryPrice(pkg.savings)})</span>
                                )}
                              </p>
                            ) : null}
                          </div>
                          {inCart ? (
                            <span className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[--accent] px-2.5 py-1 font-semibold text-[--accent-fg]">
                              <Check size={12} strokeWidth={3} />
                              In Cart
                            </span>
                          ) : (
                            <span className="shrink-0 flex flex-col items-end text-right font-display text-sm font-semibold tabular-nums text-[--text-primary]">
                              <span className="font-bold leading-[1.1]">{formatPrimaryPrice(pkg.price, pkg.slug)}</span>
                              {showSecondary && (
                                <span className="text-[9px] font-semibold opacity-75 leading-[1.1] mt-0.5">
                                  ≈ {formatSecondaryPrice(pkg.price)}
                                </span>
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[--radius-card] border border-[--text-primary] bg-[--bg-card] p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] bg-[--accent] text-[--accent-fg]">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="font-display text-xl tracking-tight sm:text-2xl">
                  Need Bulk Orders?
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[--text-secondary]">
                  For orders exceeding{" "}
                  {new Intl.NumberFormat("en").format(
                    BULK_ORDER_CONTACT_THRESHOLD,
                  )}{" "}
                  units, contact us directly for custom pricing and priority
                  delivery.
                </p>
              </div>
            </div>
            <a
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-[--accent] px-4 py-2.5 text-sm font-semibold text-[--accent-fg] transition-colors hover:bg-[--accent-hover]"
            >
              <MessageCircle size={16} />
              Contact Us for Bulk Pricing
            </a>
          </div>
        </>
      ) : null}

      {browseMode === "digital" ? (
        <div className="space-y-8">
          {brandCategories.map((category) => {
            const categoryBrands = digitalBrands.filter(b => b.category === category.id);
            if (categoryBrands.length === 0) return null;

            return (
              <div key={category.id} className="space-y-3">
                <h3 className="font-display tracking-tight text-xl text-[--text-primary] px-1">
                  {category.label}
                </h3>
                <div className="product-icon-grid">
                  {categoryBrands.map((brand) => {
                    const isExpanded = expandedBrandId === brand.id;
                    const brandProducts = subscriptionProducts.filter((p) => brand.matchSlugs.includes(p.slug));
                    const inCartCount = brandProducts.reduce((sum, p) => {
                      const cartItem = selectedCartItems.find(item => item.productId === p.id);
                      return sum + (cartItem ? cartItem.quantity : 0);
                    }, 0);

                    return (
                      <div key={brand.id} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => { setExpandedBrandId(isExpanded ? null : brand.id); setFocusedProductSlug(null); }}
                          className={`group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[--radius-card] border transition-all duration-200 ${
                            isExpanded
                              ? "border-[--text-primary] bg-[--bg-surface]"
                              : inCartCount > 0
                              ? "border-[--accent-border] bg-[--bg-surface] hover:border-[--accent]"
                              : "border-[--border] bg-[--bg-card] hover:border-[color-mix(in_srgb,var(--text-primary)_20%,var(--border))] hover:bg-[--bg-surface]"
                          }`}
                        >
                          {inCartCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[--accent] px-1.5 text-[10px] font-bold text-[--accent-fg] shadow-sm">
                              {inCartCount}
                            </div>
                          )}
                          <div className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 ${isExpanded ? "scale-110" : "group-hover:scale-110"}`}>
                            <Image src={brand.iconUrl} alt={brand.label} fill className="object-cover" sizes="48px" />
                          </div>
                          <span className={`text-[10px] sm:text-xs font-medium tracking-tight ${isExpanded || inCartCount > 0 ? "text-[--text-primary]" : "text-[--text-secondary] group-hover:text-[--text-primary]"}`}>
                            {brand.label}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {expandedBrandId && categoryBrands.some(b => b.id === expandedBrandId) && (
                  <div className="col-span-full brand-panel-enter mt-1">
                    <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden relative">
                      <button
                        onClick={() => setExpandedBrandId(null)}
                        className="absolute right-3 top-3 p-1.5 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-surface] transition-colors z-10"
                        aria-label="Close panel"
                        type="button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                      <div className="p-4 sm:p-5">
                        {(() => {
                          const activeBrand = categoryBrands.find(b => b.id === expandedBrandId)!;
                          const brandProducts = subscriptionProducts.filter(p => activeBrand.matchSlugs.includes(p.slug));
                          return (
                            <div className="space-y-5">
                              <div className="flex items-center gap-3 pr-8">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                                  <Image src={activeBrand.iconUrl} alt={activeBrand.label} fill className="object-cover" />
                                </div>
                                <div>
                                  <h4 className="font-display text-lg tracking-tight text-[--text-primary]">{activeBrand.label} Plans</h4>
                                  <p className="text-sm text-[--text-secondary]">Select a plan to add to your cart</p>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {brandProducts.map(product => {
                                  const selectedItem = selectedCartItems.find(item => item.productId === product.id) ?? null;
                                  const isSelected = selectedItem !== null;
                                  const durationConfigs = getProductDurationConfigs(product.slug);
                                  return (
                                    <div
                                      key={product.id}
                                      className={`flex flex-col overflow-hidden rounded-[--radius-inner] border transition-colors duration-150 cursor-pointer ${isSelected ? "border-[--text-primary] bg-[--bg-card]" : focusedProductSlug === product.slug ? "border-[--text-primary] bg-[--bg-card]" : "border-[--border] bg-[--bg-surface] hover:border-[--text-primary]"}`}
                                      onClick={() => setFocusedProductSlug(focusedProductSlug === product.slug ? null : product.slug)}
                                    >
                                      <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <h5 className="font-medium text-sm leading-snug text-[--text-primary]">{product.name}</h5>
                                          {isSelected && <Badge tone="accent" className="shrink-0 text-[10px]">Added</Badge>}
                                        </div>
                                        <p className="text-xs text-[--text-secondary] mb-4">{getProductSummary(product)}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                                          {durationConfigs.map(config => {
                                            const planPrice = config.priceCalculator(Number(product.price));
                                            const isThisPlanSelected = isSelected && selectedItem.accessPlan === config.plan;
                                            return (
                                              <button
                                                key={config.plan}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (isThisPlanSelected) {
                                                    toggleProduct(product);
                                                  } else if (isSelected) {
                                                    updateProductItem(product.id, { accessPlan: config.plan });
                                                  } else {
                                                    setItems([...form.getValues("items"), { productId: product.id, accessPlan: config.plan, quantity: 1, serviceOption: undefined, targetUrl: "" }]);
                                                    if (form.getValues("bundleId")) form.setValue("bundleId", "");
                                                  }
                                                  setFocusedProductSlug(product.slug);
                                                }}
                                                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${isThisPlanSelected ? "border-[--accent] bg-[--accent] text-[--accent-fg]" : "border-[--border] bg-[--bg-card] hover:border-[--text-muted]"}`}
                                              >
                                                <span>{config.label}</span>
                                                <span className={isThisPlanSelected ? "opacity-90" : "text-[--text-secondary]"}>{formatPrimaryPrice(planPrice, product.slug, config.plan)}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* ── Desktop-only: Product Detail Panel ── */}
                              {focusedProductSlug && (() => {
                                const focusedProduct = brandProducts.find(p => p.slug === focusedProductSlug);
                                const details = focusedProduct ? getProductDetails(focusedProduct.slug) : [];
                                if (!focusedProduct || details.length === 0) return null;
                                const focusedItem = selectedCartItems.find(item => item.productId === focusedProduct.id) ?? null;
                                return (
                                  <div className="hidden lg:block brand-panel-enter">
                                    <div className="rounded-xl border border-[--accent-border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-5 relative">
                                      <button
                                        onClick={() => setFocusedProductSlug(null)}
                                        className="absolute right-3 top-3 p-1 rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-surface] transition-colors"
                                        aria-label="Close details"
                                        type="button"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                      </button>
                                      <div className="flex items-start gap-4 mb-4 pr-8">
                                        <ProductLogo
                                          className="shrink-0"
                                          iconUrl={focusedProduct.iconUrl}
                                          name={focusedProduct.name}
                                          size="md"
                                        />
                                        <div className="min-w-0">
                                          <p className="text-[10px] uppercase tracking-[0.22em] text-[--text-muted] font-semibold">Plan Details</p>
                                          <h5 className="mt-1 font-display text-base tracking-tight text-[--text-primary]">{focusedProduct.name}</h5>
                                          <p className="mt-1.5 text-xs leading-relaxed text-[--text-secondary]">{getProductSummary(focusedProduct)}</p>
                                          {focusedItem && (
                                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[--accent] font-semibold">
                                              Selected · {formatOrderItemMeta(focusedItem)} · {formatPrimaryPrice(focusedItem.unitPrice, focusedItem.product?.slug, focusedItem.accessPlan)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="rounded-lg border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[--text-muted] font-semibold mb-3">What&apos;s Included</p>
                                        <ul className="space-y-2">
                                          {details.map((detail) => (
                                            <li className="flex items-start gap-2.5" key={`${focusedProduct.slug}-detail-${detail}`}>
                                              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[--accent]" aria-hidden="true" />
                                              <span className="text-[13px] leading-relaxed text-[--text-secondary]">{detail}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleProducts.map((product) => {
            const selectedItem = selectedCartItems.find((item) => item.productId === product.id) ?? null;
            const selected = selectedItem !== null;
            const selectionMode = getProductSelectionMode(product);
            const serviceConfig = getServiceProductConfig(product);

            return (
              <div
                className={`glow-ring rounded-[--radius-card] border p-3.5 sm:p-5 text-left transition-all duration-200 ${selected ? "border-[--text-primary] bg-[--bg-surface]" : "border-[--border] bg-[--bg-card] hover:border-[--text-primary] hover:bg-[--bg-surface]"}`}
                key={product.id}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <ProductLogo name={product.name} iconUrl={product.iconUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-[17px] leading-tight tracking-tight text-[--text-primary]">{cleanDisplayName(product.name)}</h4>
                      <p className="mt-1 text-[13px] leading-relaxed text-[--text-secondary] line-clamp-2">{getProductSummary(product)}</p>
                    </div>
                  </div>
                  <button
                    className={buttonStyles({ className: "shrink-0", variant: selected ? "ghost" : "accent", size: "sm" })}
                    onClick={() => toggleProduct(product)}
                    type="button"
                  >
                    {selected ? "Remove" : "Select"}
                  </button>
                </div>

                {selectionMode === "service" && selected && serviceConfig ? (
                  <div className="mt-4 rounded-xl border border-[--border] bg-[--bg-surface] p-3">
                    <p className="mb-2 text-xs font-medium text-[--text-secondary]">Select Quantity</p>
                    <div className="flex flex-wrap gap-2">
                      {serviceConfig.quantities.map((quantity) => (
                        <button
                          key={quantity}
                          type="button"
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${selectedItem?.quantity === quantity ? "border-[--accent] bg-[--accent] text-[--accent-fg]" : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:text-[--text-primary]"}`}
                          onClick={() => updateProductItem(product.id, { quantity })}
                        >
                          {formatQuantity(quantity)}
                        </button>
                      ))}
                    </div>
                    {serviceConfig.requiresReaction && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-medium text-[--text-secondary]">Reaction Type</p>
                        <div className="flex flex-wrap gap-2">
                          {serviceReactionOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`flex h-8 items-center rounded-lg border px-3 text-sm font-medium transition-colors ${selectedItem?.serviceOption === option.value ? "border-[--accent] bg-[--accent] text-[--accent-fg]" : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:text-[--text-primary]"}`}
                              onClick={() => updateProductItem(product.id, { serviceOption: option.value })}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {selected && getProductDetails(product.slug).length > 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-[--accent-border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-1">
                    <ProductDetailBlock
                      eyebrow={selectionMode === "service" ? "Service Setup" : "Included with access plan"}
                      note={`Selected ${formatOrderItemMeta(selectedItem!)} · ${formatPrimaryPrice(selectedItem!.unitPrice, selectedItem!.product?.slug, selectedItem!.accessPlan)}`}
                      product={product}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
