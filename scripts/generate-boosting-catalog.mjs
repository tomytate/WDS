import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const quantityPresets = [100, 500, 1000, 10000, 50000];
const boostingPriceMultiplier = 0.5;

const supportedPlatformMap = {
  Facebook: {
    category: "facebook-boosting",
    iconUrl: "/logos/facebook.svg",
    network: "facebook",
    platform: "meta",
  },
  Instagram: {
    category: "instagram-boosting",
    iconUrl: "/logos/instagram.svg",
    network: "instagram",
    platform: "meta",
  },
  Telegram: {
    category: "telegram-boosting",
    iconUrl: "/logos/telegram.svg",
    network: "telegram",
    platform: "telegram",
  },
  TikTok: {
    category: "tiktok-boosting",
    iconUrl: "/logos/tiktok.svg",
    network: "tiktok",
    platform: "tiktok",
  },
  "Twitter/X": {
    category: "twitter-x-boosting",
    iconUrl: "/logos/x.svg",
    network: "twitter-x",
    platform: "twitter-x",
  },
  YouTube: {
    category: "youtube-boosting",
    iconUrl: "/logos/youtube.svg",
    network: "youtube",
    platform: "youtube",
  },
};

const facebookExplicitKeepNames = new Set([
  "Facebook Followers - Lifetime",
  "Facebook Followers - No Refill",
  "Facebook Followers [Global] - Lifetime",
  "Facebook Followers [Global] - No Refill",
  "Facebook Followers [High Quality] - Lifetime",
  "Facebook Followers [High Quality] - No Refill",
  "Facebook Group Members - Lifetime",
  "Facebook Group Members - No Refill",
  "Facebook Group Members [Bot] - Lifetime",
  "Facebook Group Members [Bot] - No Refill",
  "Facebook Group Members [High Quality] - Lifetime",
  "Facebook Group Members [High Quality] - No Refill",
  "Facebook Likes",
  "Facebook Page Likes - Lifetime",
  "Facebook Page Likes - No Refill",
  "Facebook Post Likes - No Refill",
  "Facebook Post Likes [Bot] - No Refill",
  "Facebook Post Reaction - Angry 😡 - No Refill",
  "Facebook Post Reaction - Care 🤗 - No Refill",
  "Facebook Post Reaction - Haha 😆 - No Refill",
  "Facebook Post Reaction - Like 👍 - No Refill",
  "Facebook Post Reaction - Love ❤️ - No Refill",
  "Facebook Post Reaction - Sad 😢 - No Refill",
  "Facebook Post Reaction - Wow 😮 - No Refill",
  "Facebook Post Reaction [Global] - Refill 30D",
]);

const instagramExplicitKeepNames = new Set([
  "Instagram Followers - Lifetime",
  "Instagram Followers - No Refill",
  "Instagram Followers [Old Accounts] - Lifetime",
  "Instagram Followers [Old Accounts] - AI Refill 30D",
  "Instagram Followers [Old Accts w/Posts] - Lifetime",
  "Instagram Followers [Old Accts w/Posts] - No Refill",
  "Instagram Followers [Real Accounts] - Lifetime",
  "Instagram Followers [Real Accounts]",
  "Instagram Likes - Lifetime",
  "Instagram Likes - No Refill",
  "Instagram Likes [High Quality] - No Refill",
  "Instagram Likes [Old Accts w/Posts] - Lifetime",
  "Instagram Likes [Old Accts w/Posts] - No Refill",
  "Instagram Likes [Real Accounts] - No Refill",
  "Instagram Likes [Real] - Lifetime",
]);

const facebookPatternKeeps = [
  /^Facebook Comments/i,
  /^Facebook Shares/i,
  /^Facebook Views/i,
  /^Facebook Plays/i,
  /^Facebook Live Stream Views/i,
  /^Facebook Watch Time/i,
];

const instagramPatternKeeps = [
  /^Instagram Comments/i,
  /^Instagram Shares/i,
  /^Instagram Views/i,
  /^Instagram Video Views/i,
];

const tikTokExplicitKeepNames = new Set([
  "TikTok Followers - No Refill",
  "TikTok Followers [High Quality] - No Refill",
  "TikTok Followers [Real]",
  "TikTok Followers [High Quality] - Refill 7D",
  "TikTok Followers [Real] - Lifetime",
  "TikTok Followers [Real] - No Refill",
  "TikTok Likes - Lifetime",
  "TikTok Likes - No Refill",
  "TikTok Likes [High Quality] - Lifetime",
  "TikTok Likes [High Quality] - No Refill",
  "TikTok Likes [Real Accounts] - No Refill",
  "TikTok Likes [Real] - Lifetime",
  "TikTok Likes + Views [Real Accounts] - No Refill",
  "TikTok Video Views - Lifetime",
  "TikTok Video Views [High Quality] - No Refill",
]);

const tikTokPatternKeeps = [
  /^TikTok Comments/i,
  /^TikTok Shares/i,
  /^TikTok Live Stream Views/i,
];

const platformBlockedPatterns = {
  Telegram: [/^Telegram Service/i],
  YouTube: [/^YouTube Service/i],
  "Twitter/X": [/^Twitter\/X Service/i],
};

const renamedServiceNames = new Map([
  ["Facebook Followers - Lifetime", "Facebook Followers [Low Quality] - Lifetime"],
  ["Facebook Followers - No Refill", "Facebook Followers [Low Quality] - No Refill"],
  ["Facebook Group Members [Bot] - Lifetime", "Facebook Group Members [Low Quality] - Lifetime"],
  ["Facebook Group Members [Bot] - No Refill", "Facebook Group Members [Low Quality] - No Refill"],
  ["Facebook Post Likes [Bot] - No Refill", "Facebook Post Likes [Low Quality] - No Refill"],
  ["Facebook Post Reaction [Global] - Refill 30D", "Facebook Post Reaction [Global] - [High Quality]"],
  ["Instagram Followers [Old Accounts] - AI Refill 30D", "Instagram Followers [Old Accounts] - AI Refill"],
  ["TikTok Video Views [High Quality] - No Refill", "TikTok Video Views [High Quality]"],
]);

function shouldKeepMetaService(platform, name) {
  const blockedPatterns = platformBlockedPatterns[platform];

  if (blockedPatterns?.some((pattern) => pattern.test(name))) {
    return false;
  }

  if (platform === "Facebook") {
    return (
      facebookExplicitKeepNames.has(name) ||
      facebookPatternKeeps.some((pattern) => pattern.test(name))
    );
  }

  if (platform === "Instagram") {
    return (
      instagramExplicitKeepNames.has(name) ||
      instagramPatternKeeps.some((pattern) => pattern.test(name))
    );
  }

  if (platform === "TikTok") {
    return (
      tikTokExplicitKeepNames.has(name) ||
      tikTokPatternKeeps.some((pattern) => pattern.test(name))
    );
  }

  return true;
}

function renameService(platform, name) {
  if (platform !== "Facebook" && platform !== "Instagram" && platform !== "TikTok") {
    return name;
  }

  const explicitRename = renamedServiceNames.get(name);

  if (explicitRename) {
    return explicitRename;
  }

  return name.replace(/\[Bot\]/g, "[Low Quality]");
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  function pushField() {
    row.push(field);
    field = "";
  }

  function pushRow() {
    if (row.length === 1 && row[0] === "") {
      row = [];
      return;
    }

    rows.push(row);
    row = [];
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      const nextCharacter = text[index + 1];

      if (inQuotes && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      pushField();
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      pushField();
      pushRow();
      continue;
    }

    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  const [header, ...records] = rows;
  const normalizedHeader = header.map((column) => column.replace(/^\uFEFF/, ""));

  return records
    .filter((record) => record.length === normalizedHeader.length)
    .map((record) =>
      Object.fromEntries(
        normalizedHeader.map((column, columnIndex) => [column, record[columnIndex]]),
      ),
    );
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const PHP_TO_USDT_ANCHOR = 57.5;

function toUsdtPrice(sellPricePhp) {
  const amount = Number.parseFloat(sellPricePhp);

  if (!Number.isFinite(amount) || amount < 0) {
    return "0.00";
  }

  return ((amount * boostingPriceMultiplier) / PHP_TO_USDT_ANCHOR).toFixed(2);
}

function getAvailableQuantities(minQuantity, maxQuantity) {
  return quantityPresets.filter(
    (quantity) => quantity >= minQuantity && quantity <= maxQuantity,
  );
}

function pickBestRow(rows) {
  const rankedRows = rows
    .map((row) => {
      const minQuantity = Number.parseInt(row.min_qty, 10);
      const maxQuantity = Number.parseInt(row.max_qty, 10);
      const availableQuantities = getAvailableQuantities(minQuantity, maxQuantity);

      return {
        availableQuantities,
        maxQuantity,
        minQuantity,
        sellPrice: Number.parseFloat(row.sell_price_php),
        ...row,
      };
    })
    .filter((row) => row.availableQuantities.length > 0)
    .sort((left, right) => {
      if (right.availableQuantities.length !== left.availableQuantities.length) {
        return right.availableQuantities.length - left.availableQuantities.length;
      }

      if (left.sellPrice !== right.sellPrice) {
        return left.sellPrice - right.sellPrice;
      }

      if (left.minQuantity !== right.minQuantity) {
        return left.minQuantity - right.minQuantity;
      }

      return right.maxQuantity - left.maxQuantity;
    });

  return rankedRows[0] ?? null;
}

function formatCatalogLine(item) {
  return `  [${[
    item.serviceId,
    JSON.stringify(item.platform),
    item.network ? JSON.stringify(item.network) : "null",
    JSON.stringify(item.name),
    JSON.stringify(item.slug),
    JSON.stringify(item.category),
    JSON.stringify(item.pricePerThousand),
    item.minQuantity,
    item.maxQuantity,
    JSON.stringify(item.deliveryTime),
    item.iconUrl ? JSON.stringify(item.iconUrl) : "null",
  ].join(", ")}],`;
}

function main() {
  const csvPath = process.argv[2];
  const outputPath =
    process.argv[3] ||
    resolve("./packages/db/src/boosting-service-catalog.generated.ts");

  if (!csvPath) {
    throw new Error("Usage: node scripts/generate-boosting-catalog.mjs <csv-path> [output-path]");
  }

  const csvText = readFileSync(resolve(csvPath), "utf8");
  const records = parseCsv(csvText);
  const groupedRecords = new Map();

  for (const record of records) {
    const supportedPlatform = supportedPlatformMap[record.platform];

    if (!supportedPlatform) {
      continue;
    }

    const productName = record.product_name?.trim();

    if (!productName) {
      continue;
    }

    if (!shouldKeepMetaService(record.platform, productName)) {
      continue;
    }

    const groupKey = `${record.platform}::${productName}`;
    const group = groupedRecords.get(groupKey) ?? [];

    group.push(record);
    groupedRecords.set(groupKey, group);
  }

  const seenSlugs = new Set();
  const catalogItems = [...groupedRecords.values()]
    .map((group) => {
      const selectedRow = pickBestRow(group);

      if (!selectedRow) {
        return null;
      }

      const platformConfig = supportedPlatformMap[selectedRow.platform];
      const renamedName = renameService(selectedRow.platform, selectedRow.product_name.trim());
      let slug = slugify(renamedName);

      if (seenSlugs.has(slug)) {
        slug = `${slug}-${selectedRow.service_id}`;
      }

      seenSlugs.add(slug);

      return {
        category: platformConfig.category,
        deliveryTime: selectedRow.delivery_time.trim() || "Provider estimate unavailable",
        iconUrl: platformConfig.iconUrl,
        maxQuantity: selectedRow.maxQuantity,
        minQuantity: selectedRow.minQuantity,
        name: renamedName,
        network: platformConfig.network,
        platform: platformConfig.platform,
        pricePerThousand: toUsdtPrice(selectedRow.sell_price_php),
        serviceId: Number.parseInt(selectedRow.service_id, 10),
        slug,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.platform !== right.platform) {
        return left.platform.localeCompare(right.platform);
      }

      if ((left.network || "") !== (right.network || "")) {
        return (left.network || "").localeCompare(right.network || "");
      }

      return left.name.localeCompare(right.name);
    });

  const fileContents = `import type { ServiceQuantity } from "./types"

export type BoostingPlatform = "meta" | "telegram" | "tiktok" | "twitter-x" | "youtube" | "spotify" | "twitch"
export type BoostingNetwork = "facebook" | "instagram" | "telegram" | "tiktok" | "twitter-x" | "youtube"

export const supportedServiceQuantities = [100, 500, 1000, 10000, 50000] as const satisfies readonly ServiceQuantity[]

export type BoostingCatalogRow = readonly [
  serviceId: number,
  platform: BoostingPlatform,
  network: BoostingNetwork | null,
  name: string,
  slug: string,
  category: string,
  pricePerThousand: string,
  minQuantity: number,
  maxQuantity: number,
  deliveryTime: string,
  iconUrl: string | null,
]

// Generated from the PH market CSV source. Re-run scripts/generate-boosting-catalog.mjs to refresh.
export const boostingCatalogRows = [
${catalogItems.map(formatCatalogLine).join("\n")}
] as const satisfies readonly BoostingCatalogRow[]
`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, fileContents);
  console.log(`Generated ${catalogItems.length} boosting services to ${outputPath}`);
}

main();
