type ProductSummaryInput = {
  slug: string
  description?: string | null
}

type ProductCopy = {
  summary: string
  details: string[]
}

const defaultSummary = "Flexible access with clean pricing and fast digital delivery."

const productCopyBySlug: Record<string, ProductCopy> = {
  "google-ai-pro": {
    summary:
      "Google AI Pro with Gemini 3.1 Pro, 5 TB storage, and AI tools across the Google ecosystem.",
    details: [
      "Gemini 3.1 Pro in the Gemini app with higher usage limits.",
      "Gemini integration across Gmail, Docs, Sheets, Slides, and Chrome.",
      "NotebookLM with expanded Audio Overviews.",
      "Google Home Premium and advanced Google Photos editing.",
      "5 TB total storage across Photos, Drive, and Gmail.",
      "6-month and 1-year plans available.",
    ],
  },
  "chatgpt-go": {
    summary:
      "ChatGPT Go — expanded usage, GPT-5.2 Instant access, and extended memory.",
    details: [
      "Access to the GPT-5.2 Instant model.",
      "10x more messages, uploads, and image generation vs. Free tier.",
      "Extended memory and larger context window.",
      "1-year access included.",
    ],
  },
  "chatgpt-pro": {
    summary:
      "ChatGPT Pro with GPT-5.4, Codex agent, Sora video, and Deep Research.",
    details: [
      "Unlimited access to GPT-5.4 and all frontier models.",
      "Codex AI agent for writing features, fixing bugs, and refactoring.",
      "Deep Research and Sora video generation included.",
      "5x usage limits vs. Plus (expandable to 20x on higher tier).",
      "Priority access to new features and tools.",
      "6-month or 1-year plans available.",
    ],
  },
  "chatgpt-renew-plus": {
    summary:
      "Renewal code for ChatGPT Plus. Apply directly to your existing OpenAI account.",
    details: [
      "One-time renewal code for ChatGPT Plus subscription.",
      "Apply directly in your OpenAI account settings.",
      "Preserves all custom GPTs, saved conversations, and settings.",
      "Instant code delivery after payment confirmation.",
    ],
  },
  "capcut-shared": {
    summary:
      "CapCut Pro Team with 4K export, AI editing tools, premium assets, and shared cloud storage.",
    details: [
      "4K export, advanced transitions, and professional editing tools.",
      "AI auto captions, background removal, motion tracking, and voice effects.",
      "Full library of premium templates, effects, filters, and royalty-free music.",
      "100 GB shared cloud storage with team project support.",
      "Annual or lifetime plans available.",
    ],
  },
  netflix: {
    summary:
      "Netflix Premium shared access with 4K UHD, HDR, and spatial audio.",
    details: [
      "Stream in 4K Ultra HD and HDR on supported content.",
      "Spatial audio available on 700+ top titles.",
      "Stream on up to 4 devices simultaneously.",
      "Download on up to 6 devices for offline viewing.",
      "6-month shared Premium plan with setup included.",
    ],
  },
  "perplexity-pro": {
    summary:
      "Perplexity Pro on your own account with unlimited Pro Search, Deep Research, and multi-model access.",
    details: [
      "Unlimited Pro Search with AI-powered, cited answers.",
      "Access to GPT-5.2, Claude Sonnet 4.6, Gemini 3.1 Pro, and Sonar models.",
      "Model Council — auto-routes queries through multiple frontier models.",
      "20 Deep Research queries per day for multi-step investigations.",
      "File upload and analysis support (PDF, images, audio, video).",
      "6-month or 1-year plans available.",
    ],
  },
  "figma-edu": {
    summary:
      "Figma Education plan on your own account with full professional design tools.",
    details: [
      "Unlimited files and projects.",
      "Full access to Figma design, prototyping, and Dev Mode.",
      "Shared team libraries and design systems.",
      "1-year plan on your own account.",
    ],
  },
  "figma-pro": {
    summary:
      "Figma Professional plan with unlimited projects, team libraries, and Dev Mode.",
    details: [
      "Unlimited Figma files and projects.",
      "Shared team libraries and design systems.",
      "Unlimited version history and branching.",
      "Dev Mode for developer handoff.",
      "6-month plan on your own account.",
    ],
  },
  "claude-pro": {
    summary:
      "Claude Pro on your own account — 5x usage, extended thinking, and Claude Code.",
    details: [
      "5x the usage of the Free tier on a rolling 5-hour window.",
      "Extended thinking for complex reasoning and research tasks.",
      "Claude Code terminal agent included.",
      "Access to Claude Opus 4.6, Sonnet 4.6, and Haiku.",
      "Cross-conversation memory and unlimited projects.",
      "6-month or 1-year plans available.",
    ],
  },
  "claude-max-5x": {
    summary:
      "Claude Max 5x — 5x Pro usage limit on a rolling 5-hour window for power users.",
    details: [
      "5x the Claude Pro usage limit for heavy daily workflows.",
      "All Pro features plus higher output limits.",
      "Priority access to Opus 4.6 and Sonnet 4.6 during high traffic.",
      "Claude Code and extended thinking included.",
      "6-month or 1-year plans available.",
    ],
  },
  "claude-max-20x": {
    summary:
      "Claude Max 20x — 20x Pro usage limit for uninterrupted AI workflows and agentic pipelines.",
    details: [
      "20x the Claude Pro usage limit — maximum throughput available.",
      "Built for continuous agentic workflows and large codebases.",
      "Priority access and early access to new models and features.",
      "Claude Code and extended thinking included.",
      "6-month or 1-year plans available.",
    ],
  },
  "claude-team-standard": {
    summary:
      "Claude Team with standard seat — collaborative workspace with admin controls.",
    details: [
      "Team workspace with shared conversations and projects.",
      "Access to Claude Sonnet 4.6 and Haiku models.",
      "Admin controls, team permissions, and usage analytics.",
      "1-month, 6-month, or 1-year plans available.",
    ],
  },
  "claude-team-premium": {
    summary:
      "Claude Team with premium seat — full Opus access, Claude Code, and higher limits.",
    details: [
      "Everything in Standard, plus Claude Opus 4.6 access.",
      "Claude Code terminal agent included for each seat.",
      "Higher usage limits and priority during peak hours.",
      "1-month, 6-month, or 1-year plans available.",
    ],
  },
  "cursor-pro-presupplied": {
    summary:
      "Cursor Pro on a pre-supplied account — start coding with AI immediately.",
    details: [
      "Unlimited Tab completions and unlimited Auto mode.",
      "$20/month AI credit pool for premium model selection (Claude, GPT-5, Gemini).",
      "Pre-supplied account ready to use immediately.",
      "2-year access included.",
    ],
  },
  "cursor-pro-own": {
    summary:
      "Cursor Pro on your own account — unlimited Tab, Auto mode, and $20/month AI credits.",
    details: [
      "Unlimited Tab completions and Auto mode.",
      "$20/month AI credit pool for Claude, GPT-5, and Gemini models.",
      "Credits consumed based on model and task complexity.",
      "Applied directly to your own Cursor account.",
      "6-month plan.",
    ],
  },
  "cursor-pro-plus-own": {
    summary:
      "Cursor Pro+ — 3x AI credits ($60/month) for heavy coding workflows on your own account.",
    details: [
      "Everything in Cursor Pro, plus 3x the monthly AI credit pool ($60).",
      "Ideal for developers who regularly exceed Pro credit limits.",
      "Unlimited Tab completions and Auto mode.",
      "6-month plan on your own account.",
    ],
  },
  "cursor-ultra-own": {
    summary:
      "Cursor Ultra — 20x AI credits ($200/month) for full-time AI-native development.",
    details: [
      "20x the monthly AI credit pool ($200) for maximum throughput.",
      "Unlimited Tab completions, Auto mode, and background agents.",
      "Priority access to new Cursor features.",
      "6-month plan on your own account.",
    ],
  },
  "jetbrains-edu": {
    summary:
      "Full JetBrains All Products Pack on your own account — 1-year educational license.",
    details: [
      "IntelliJ IDEA Ultimate, WebStorm, PyCharm, CLion, GoLand, Rider, and more.",
      "Includes PhpStorm, RubyMine, RustRover, DataGrip, and DataSpell.",
      "Applied to your own JetBrains account.",
      "For educational and non-commercial use only.",
      "1-year license, renewable annually.",
    ],
  },
  "super-grok": {
    summary:
      "SuperGrok on your own X account — Grok 4 reasoning, Aurora image generation, and DeepSearch.",
    details: [
      "Grok 4 with advanced multi-agent reasoning and DeepSearch.",
      "Aurora image generation and visual analysis.",
      "2M token context window and real-time web search.",
      "Extended memory across conversations.",
      "1-month or 6-month plans on your own X (Twitter) account.",
    ],
  },
  "expressvpn-pro": {
    summary:
      "ExpressVPN Premium with Lightway protocol for fast, private browsing worldwide.",
    details: [
      "Lightway protocol for fast, battery-efficient connections.",
      "RAM-only servers in 105+ countries.",
      "256-bit AES encryption with split tunneling and kill switch.",
      "Pre-supplied account, 1-month plan.",
    ],
  },
  "pia-vpn": {
    summary:
      "Private Internet Access VPN with verified no-logs policy and massive global network.",
    details: [
      "Open-source apps with strict, audited no-logs policy.",
      "35,000+ RAM-only servers across 91 countries.",
      "WireGuard protocol and PIA MACE ad/malware blocking.",
      "2-year access plan.",
    ],
  },
}

export function getProductSummary(product: ProductSummaryInput) {
  return productCopyBySlug[product.slug]?.summary ?? product.description ?? defaultSummary
}

export function getProductDetails(slug: string) {
  return productCopyBySlug[slug]?.details ?? []
}

export function getProductDuration(slug: string): { badge: string, description: string } {
  if (slug.includes("1y") || slug === "chatgpt-go" || slug === "figma-edu" || slug === "jetbrains-edu") {
    return { badge: "1-Year Plan", description: "Full 1-Year access included." }
  }
  if (slug === "cursor-pro-presupplied" || slug === "pia-vpn") {
    return { badge: "2-Year Plan", description: "Full 2-Year access included." }
  }
  if (slug === "expressvpn-pro") {
    return { badge: "1-Month Plan", description: "Full 1-Month access included." }
  }
  if (slug === "super-grok") {
    return { badge: "1-Mo / 6-Mo", description: "1-Month or 6-Month plans available." }
  }
  if (slug === "capcut-shared") {
    return { badge: "1Y / Lifetime", description: "1 Year included. Select lifetime in order form." }
  }
  if (slug === "google-ai-pro" || slug === "chatgpt-pro" || slug === "perplexity-pro") {
    return { badge: "6-Mo / 1-Year", description: "6 Months included. Select 1-Year in order form." }
  }
  if (slug === "chatgpt-renew-plus") {
    return { badge: "1-Month Renewal", description: "Extends your current plan by 1-Month." }
  }
  if (slug === "claude-team-standard" || slug === "claude-team-premium") {
    return { badge: "1-Mo / 6-Mo / 1Y", description: "1-Month, 6-Month, or 1-Year plans available." }
  }
  if (slug.startsWith("claude-")) {
    return { badge: "6-Mo / 1-Year", description: "6-Month or 1-Year plans available." }
  }
  if (slug === "netflix" || slug === "figma-pro" || slug.startsWith("cursor-")) {
    return { badge: "6-Month Plan", description: "Full 6-Month access included." }
  }
  
  return { badge: "Standard Plan", description: "Standard access duration included." }
}
