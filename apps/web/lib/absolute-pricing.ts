export type AbsolutePrice = {
  php: number | null;
  usdt: number;
};

export const ABSOLUTE_PRICES: Record<string, AbsolutePrice> = {
  "chatgpt-go": { php: 399, usdt: 6.90 },
  "chatgpt-plus-6m": { php: 499, usdt: 8.00 },
  "chatgpt-plus-1y": { php: 699, usdt: 15.00 },
  "chatgpt-plus-lifetime": { php: 1399, usdt: 25.00 },
  "chatgpt-pro-6m": { php: 899, usdt: 19.00 },
  "chatgpt-pro-1y": { php: 1599, usdt: 29.00 },
  "claude-pro-1m": { php: 999, usdt: 18.00 },
  "claude-pro": { php: 6999, usdt: 99.00 },
  "claude-pro-1y": { php: 12999, usdt: 199.00 },
  "claude-max-5x-1m": { php: null, usdt: 99.00 },
  "claude-max-5x": { php: 28999, usdt: 499.00 },
  "claude-max-5x-1y": { php: 49999, usdt: 899.00 },
  "claude-max-20x-1m": { php: null, usdt: 199.00 },
  "claude-max-20x": { php: 45999, usdt: 999.00 },
  "claude-max-20x-1y": { php: 79999, usdt: 1899.00 },
  "claude-team-standard-1m": { php: 999, usdt: 18.00 },
  "claude-team-standard-6m": { php: 4999, usdt: 99.00 },
  "claude-team-standard-1y": { php: 8999, usdt: 199.00 },
  "claude-team-premium-1m": { php: 5499, usdt: 99.00 },
  "claude-team-premium-6m": { php: 24999, usdt: 399.00 },
  "claude-team-premium-1y": { php: 44999, usdt: 799.00 },
  "google-ai-pro-6m": { php: 399, usdt: 7.00 },
  "google-ai-pro": { php: 599, usdt: 12.00 },
  "google-ai-ultra": { php: 6500, usdt: 99.00 },
  "google-ai-ultra-lifetime": { php: 9999, usdt: 299.00 },
  "super-grok-6m": { php: 3499, usdt: 69.00 },
  "super-grok-1y": { php: 6999, usdt: 120.00 },
  "perplexity-pro": { php: 2500, usdt: 50.00 },
  "perplexity-pro-lifetime": { php: 3999, usdt: 80.00 },
  "netflix": { php: 400, usdt: 6.70 },
  "netflix-1y": { php: 700, usdt: 11.70 },
  "cursor-pro-presupplied": { php: 6999, usdt: 116.80 },
  "cursor-pro-own-6m": { php: 4999, usdt: 83.40 },
  "cursor-pro-own-1y": { php: 8999, usdt: 150.20 },
  "cursor-pro-plus-own-6m": { php: 9999, usdt: 166.80 },
  "cursor-pro-plus-own-1y": { php: 18999, usdt: 317.00 },
  "cursor-ultra-own-6m": { php: 19999, usdt: 333.70 },
  "cursor-ultra-own-1y": { php: 35999, usdt: 600.70 },
  "adobe-cc-pro-3m": { php: 999, usdt: 16.70 },
  "adobe-cc-pro-6m": { php: 1799, usdt: 30.00 },
  "adobe-cc-pro-1y": { php: 2499, usdt: 41.70 },
  "capcut-pro-1y": { php: 699, usdt: 11.70 },
  "figma-edu": { php: 500, usdt: 8.30 },
  "office-365-lifetime": { php: 1000, usdt: 16.70 },
  "coursera-business-1m": { php: 699, usdt: 11.70 },
};

/**
 * Helper to retrieve an absolute price for a product.
 */
export function getAbsolutePrice(slug: string): AbsolutePrice | null {
  return ABSOLUTE_PRICES[slug] ?? null;
}
