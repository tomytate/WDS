export const upsellRules: Record<string, string[]> = {
  "chatgpt-pro": ["grammarly-premium", "midjourney", "claude-pro"],
  "canva-pro": ["capcut-pro", "adobe-express"],
  "spotify-premium": ["youtube-premium", "netflix-premium"],
  "netflix-premium": ["spotify-premium", "youtube-premium"],
  "youtube-premium": ["spotify-premium", "netflix-premium"],
  "grammarly-premium": ["chatgpt-pro", "quilbot-premium"],
  "midjourney": ["chatgpt-pro", "canva-pro"],
}

export function getUpsellSuggestions(selectedSlugs: string[]): string[] {
  const suggestions = new Set<string>()

  for (const slug of selectedSlugs) {
    const rules = upsellRules[slug]
    if (rules) {
      for (const suggestion of rules) {
        if (!selectedSlugs.includes(suggestion)) {
          suggestions.add(suggestion)
        }
      }
    }
  }

  return Array.from(suggestions)
}
