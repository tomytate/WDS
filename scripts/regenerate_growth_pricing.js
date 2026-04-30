const fs = require("fs");
const path = require("path");

const p = path.join("w:", "Documents", "WDS", "packages", "db", "src", "growth-packages.ts");

let content = fs.readFileSync(p, "utf-8");

// Convert a price in USDT to PHP using the exact math expression string `value * 57.5`
// We'll just replace the lines `price: XYZ,` with `price: value * 57.5,`
function updatePackage(regexPattern, replacements) {
    let matchIdx = -1;
    // We'll parse the file using simple string replacement for the specific blocks.
}

// Actually, since the file is perfectly structured, it's easier to just generate it entirely!
const fileTop = `export type GrowthPackageData = {
  id: string;
  slug: string;
  name: string;
  followers?: number;
  subscribers?: number;
  views?: number;
  likes: number;
  shares?: number;
  comments?: number;
  price: number;
  savings?: number;
  tierName?: string;
};

export type GrowthPackagePlatformData = {
  platform: string;
  iconUrl: string;
  quality: "bot" | "real" | "high-quality" | "all-in-one";
  packages: GrowthPackageData[];
};

/* ═══════════════════════════════════════════════
   YouTube Monetization Packages (Real)
   ═══════════════════════════════════════════════ */

export const youtubeMonetizationPackages: GrowthPackagePlatformData = {
  platform: "YouTube",
  iconUrl: "/logos/youtube.svg",
  quality: "real",
  packages: [
`;

function pkg(idNum, block, slug, name, props, priceRaw, tierName, isLast) {
    let fields = [];
    fields.push(`      id: "00000000-0000-5000-000${block}-00000000000${idNum}",`);
    fields.push(`      slug: "${slug}",`);
    fields.push(`      name: "${name}",`);
    for (const [k, v] of Object.entries(props)) {
        fields.push(`      ${k}: ${v},`);
    }
    fields.push(`      price: ${priceRaw} * 57.5,`);
    fields.push(`      tierName: "${tierName}",`);
    return "    {\n" + fields.join("\n") + "\n    }" + (isLast ? "" : ",");
}

let out = fileTop;

// YouTube Monetization (Block 0)
const ytmPrices = [9.99, 20.99, 39.99, 79.99, 189.99, 364.99, 529.99, 694.99];
const ytmStats = [
    { subscribers: 100, views: 100, likes: 500 },
    { subscribers: 250, views: 250, likes: 1250 },
    { subscribers: 500, views: 500, likes: 2500 },
    { subscribers: 1000, views: 1000, likes: 5000 },
    { subscribers: 2500, views: 2500, likes: 12500 },
    { subscribers: 5000, views: 5000, likes: 25000 },
    { subscribers: 7500, views: 7500, likes: 37500 },
    { subscribers: 10000, views: 10000, likes: 50000 },
];
const tiers8 = ["Starter", "Growth", "Momentum", "Milestone", "Breakout", "Influencer", "Authority", "Domination"];
const tiers6 = ["Starter", "Growth", "Momentum", "Breakout", "Influencer", "Authority"];

for(let i=0; i<8; i++) {
    out += pkg(i+1, "0", `yt-monetize-${i+1}`, `YouTube Monetization - ${tiers8[i]}`, ytmStats[i], ytmPrices[i], tiers8[i], i===7) + "\n";
}
out += "  ],\n};\n\n";

out += `/* ═══════════════════════════════════════════════
   Premium Growth Packages (High-Quality)
   ═══════════════════════════════════════════════ */

export const premiumGrowthPackages: GrowthPackagePlatformData[] = [
`;

// Premium FB/IG 
const premFbIgPrices = [4.99, 9.99, 19.99, 44.99, 104.99, 199.99];
const premFbIgStats = [
    { followers: 1000, likes: 500 },
    { followers: 5000, likes: 1500 },
    { followers: 10000, likes: 2500 },
    { followers: 20000, likes: 5000 },
    { followers: 50000, likes: 10000 },
    { followers: 100000, likes: 20000 },
];
// FB block 6
out += '  {\n    platform: "Facebook",\n    iconUrl: "/logos/facebook.svg",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "6", `fb-premium-${i+1}`, `Facebook Premium - ${tiers6[i]}`, premFbIgStats[i], premFbIgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// IG block 7
out += '  {\n    platform: "Instagram",\n    iconUrl: "/logos/instagram.svg",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "7", `ig-premium-${i+1}`, `Instagram Premium - ${tiers6[i]}`, premFbIgStats[i], premFbIgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Premium TikTok block 1
const premTkPrices = [9.99, 29.99, 64.99, 154.99, 284.99, 519.99];
out += '  {\n    platform: "TikTok",\n    iconUrl: "/logos/tiktok.svg",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "1", `tk-premium-${i+1}`, `TikTok Premium - ${tiers6[i]}`, premFbIgStats[i], premTkPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Premium X/Twitter block 9
const premXPrices = [7.99, 19.99, 39.99, 79.99, 189.99, 349.99];
out += '  {\n    platform: "Twitter/X",\n    iconUrl: "/logos/x.svg",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "9", `x-premium-${i+1}`, `Twitter/X Premium - ${tiers6[i]}`, premFbIgStats[i], premXPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Premium Telegram block F
// User requested: 1000/50, 2500/100, 5000/250, 10000/500, 20000/1000, 40000/2000
const premTgPrices = [29.99, 69.99, 134.99, 259.99, 499.99, 949.99];
const premTgStats = [
    { subscribers: 1000, likes: 50 },
    { subscribers: 2500, likes: 100 },
    { subscribers: 5000, likes: 250 },
    { subscribers: 10000, likes: 500 },
    { subscribers: 20000, likes: 1000 },
    { subscribers: 40000, likes: 2000 },
];
out += '  {\n    platform: "Telegram",\n    iconUrl: "/logos/telegram.svg",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "F", `tg-premium-${i+1}`, `Telegram Premium Members - ${tiers6[i]}`, premTgStats[i], premTgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Premium Spotify block 10, using views to represent "Premium Playtime"
const premSpPrices = [89.99, 199.99, 354.99, 614.99, 1324.99, 2200.00];
const premSpStats = [
    { followers: 1000, views: 1000, likes: 0 },
    { followers: 2500, views: 2500, likes: 0 },
    { followers: 5000, views: 5000, likes: 0 },
    { followers: 10000, views: 10000, likes: 0 },
    { followers: 25000, views: 25000, likes: 0 },
    { followers: 50000, views: 50000, likes: 0 },
];
out += '  {\n    platform: "Spotify",\n    iconUrl: "/logos/spotify.png",\n    quality: "high-quality",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "10", `sp-premium-${i+1}`, `Spotify Premium - ${tiers6[i]}`, premSpStats[i], premSpPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n];\n\n';

// All in One generator
out += `/* ═══════════════════════════════════════════════
   All-in-One Premium Packages
   Includes: Followers + Likes + Shares + Custom Comments
   Price: Premium base × 1.85 (85% markup)
   Shares baseline: 250, Comments baseline: 100
   ═══════════════════════════════════════════════ */

export const allInOnePremiumPackages: GrowthPackagePlatformData[] = [
`;

const aioStats = [
    { followers: 1000, likes: 500, shares: 250, comments: 100 },
    { followers: 5000, likes: 1500, shares: 500, comments: 200 },
    { followers: 10000, likes: 2500, shares: 750, comments: 300 },
    { followers: 20000, likes: 5000, shares: 1000, comments: 500 },
    { followers: 50000, likes: 10000, shares: 2000, comments: 800 },
    { followers: 100000, likes: 20000, shares: 3000, comments: 1200 },
];
// AIO FB block A
out += '  {\n    platform: "Facebook",\n    iconUrl: "/logos/facebook.svg",\n    quality: "all-in-one",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "A", `fb-aio-${i+1}`, `Facebook All-in-One - ${tiers6[i]}`, aioStats[i], Number((premFbIgPrices[i]*1.85).toFixed(2)), tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';
// AIO IG block B
out += '  {\n    platform: "Instagram",\n    iconUrl: "/logos/instagram.svg",\n    quality: "all-in-one",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "B", `ig-aio-${i+1}`, `Instagram All-in-One - ${tiers6[i]}`, aioStats[i], Number((premFbIgPrices[i]*1.85).toFixed(2)), tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';
// AIO TikTok block C
out += '  {\n    platform: "TikTok",\n    iconUrl: "/logos/tiktok.svg",\n    quality: "all-in-one",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "C", `tk-aio-${i+1}`, `TikTok All-in-One - ${tiers6[i]}`, aioStats[i], Number((premTkPrices[i]*1.85).toFixed(2)), tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';
// AIO X block D
out += '  {\n    platform: "Twitter/X",\n    iconUrl: "/logos/x.svg",\n    quality: "all-in-one",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "D", `x-aio-${i+1}`, `Twitter/X All-in-One - ${tiers6[i]}`, aioStats[i], Number((premXPrices[i]*1.85).toFixed(2)), tiers6[i], i===5) + "\n";
out += '    ],\n  },\n];\n\n';

// Bot growth
out += `/* ═══════════════════════════════════════════════
   Bot Growth Packages (Budget)
   ═══════════════════════════════════════════════ */

export const botGrowthPackages: GrowthPackagePlatformData[] = [
`;
const botFbIgPrices = [1.99, 4.99, 8.99, 16.99, 40.99, 77.00];

// Bot FB block 2
out += '  {\n    platform: "Facebook",\n    iconUrl: "/logos/facebook.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "2", `fb-bot-${i+1}`, `Facebook Bot Growth - ${tiers6[i]}`, premFbIgStats[i], botFbIgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';
// Bot IG block 3
out += '  {\n    platform: "Instagram",\n    iconUrl: "/logos/instagram.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "3", `ig-bot-${i+1}`, `Instagram Bot Growth - ${tiers6[i]}`, premFbIgStats[i], botFbIgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Bot TikTok block 4
const botTkPrices = [4.99, 13.99, 25.99, 69.99, 113.99, 209.99];
out += '  {\n    platform: "TikTok",\n    iconUrl: "/logos/tiktok.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "4", `tk-bot-${i+1}`, `TikTok Bot Growth - ${tiers6[i]}`, premFbIgStats[i], botTkPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Bot YouTube block 5
const botYtPrices = [1.99, 7.99, 14.99, 29.99, 74.99, 149.99];
const botYtStats = [
    { subscribers: 100, likes: 500, views: 100 },
    { subscribers: 500, likes: 2500, views: 500 },
    { subscribers: 1000, likes: 5000, views: 1000 },
    { subscribers: 2000, likes: 10000, views: 2000 },
    { subscribers: 5000, likes: 25000, views: 5000 },
    { subscribers: 10000, likes: 50000, views: 10000 },
];
out += '  {\n    platform: "YouTube",\n    iconUrl: "/logos/youtube.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "5", `yt-bot-${i+1}`, `YouTube Bot Growth - ${tiers6[i]}`, botYtStats[i], botYtPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n';

// Bot X/Twitter block 8 - User said "then the x in bot leave as is", so we reuse existing prices: 250, 625, 1250, 2500, 6000, 11250
// Wait, the existing prices are in PHP! So if I just write those exact PHP amounts, I must NOT multiply by 57.5!
const existingBotXPricesPhp = [250, 625, 1250, 2500, 6000, 11250];
out += '  {\n    platform: "Twitter/X",\n    iconUrl: "/logos/x.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) {
    // Modify pkg to NOT multiply by 57.5 for this specific one by passing the absolute code string
    let fields = [];
    fields.push(`      id: "00000000-0000-5000-0008-00000000000${i+1}",`);
    fields.push(`      slug: "x-bot-${i+1}",`);
    fields.push(`      name: "Twitter/X Bot Growth - ${tiers6[i]}",`);
    for (const [k, v] of Object.entries(premFbIgStats[i])) fields.push(`      ${k}: ${v},`);
    fields.push(`      price: ${existingBotXPricesPhp[i]},`); // no 57.5
    fields.push(`      tierName: "${tiers6[i]}",`);
    out += "    {\n" + fields.join("\n") + "\n    }" + (i===5 ? "" : ",") + "\n";
}
out += '    ],\n  },\n';

// Bot Telegram block E
const botTgPrices = [2.99, 4.99, 9.99, 19.99, 39.99, 79.99];
const botTgStats = [
    { subscribers: 1000, likes: 0 },
    { subscribers: 2500, likes: 0 },
    { subscribers: 5000, likes: 0 },
    { subscribers: 10000, likes: 0 },
    { subscribers: 20000, likes: 0 },
    { subscribers: 40000, likes: 0 },
];
out += '  {\n    platform: "Telegram",\n    iconUrl: "/logos/telegram.svg",\n    quality: "bot",\n    packages: [\n';
for(let i=0; i<6; i++) out += pkg(i+1, "E", `tg-bot-${i+1}`, `Telegram Bot Members - ${tiers6[i]}`, botTgStats[i], botTgPrices[i], tiers6[i], i===5) + "\n";
out += '    ],\n  },\n];\n\n';

out += `/* ═══════════════════════════════════════════════
   Combined Export
   ═══════════════════════════════════════════════ */

export const allGrowthPackages = [
  ...youtubeMonetizationPackages.packages,
  ...premiumGrowthPackages.flatMap((p) => p.packages),
  ...allInOnePremiumPackages.flatMap((p) => p.packages),
  ...botGrowthPackages.flatMap((p) => p.packages),
];

/** Bulk order threshold — show "Contact us" CTA for orders exceeding this */
export const BULK_ORDER_CONTACT_THRESHOLD = 100_000;
`;

fs.writeFileSync(p, out, "utf-8");
console.log("Successfully rebuilt growth-packages.ts");
