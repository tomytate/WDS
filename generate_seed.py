import json
import uuid

raw_data = """
chatgpt-go	ChatGPT Go (1y)	₱399	$6.90
chatgpt-plus-6m	ChatGPT Plus (6m)	₱499	$8.00
chatgpt-plus-1y	ChatGPT Plus (1y)	₱699	$15.00
chatgpt-plus-lifetime	ChatGPT Plus (Lifetime)	₱1,399	$25.00
chatgpt-pro-6m	ChatGPT Pro (6m)	₱899	$19.00
chatgpt-pro-1y	ChatGPT Pro (1y)	₱1,599	$29.00
claude-pro-1m	Claude Pro (1m)	₱999	$18.00
claude-pro	Claude Pro (6m)	₱6,999	$99.00
claude-pro-1y	Claude Pro (1y)	₱12,999	$199.00
claude-max-5x-1m	Claude Max 5× (1m)	-	$99.00
claude-max-5x	Claude Max 5× (6m)	₱28,999	$499.00
claude-max-5x-1y	Claude Max 5× (1y)	₱49,999	$899.00
claude-max-20x-1m	Claude Max 20× (1m)	-	$199.00
claude-max-20x	Claude Max 20× (6m)	₱45,999	$999.00
claude-max-20x-1y	Claude Max 20× (1y)	₱79,999	$1,899.00
claude-team-standard-1m	Claude Team Std (1m)	₱999	$18.00
claude-team-standard-6m	Claude Team Std (6m)	₱4,999	$99.00
claude-team-standard-1y	Claude Team Std (1y)	₱8,999	$199.00
claude-team-premium-1m	Claude Team Prem (1m)	₱5,499	$99.00
claude-team-premium-6m	Claude Team Prem (6m)	₱24,999	$399.00
claude-team-premium-1y	Claude Team Prem (1y)	₱44,999	$799.00
google-ai-pro-6m	Google AI Pro (6m)	₱399	$7.00
google-ai-pro	Google AI Pro (1y)	₱599	$12.00
google-ai-ultra	Google AI Ultra (1y)	₱6,500	$99.00
google-ai-ultra-lifetime	Google AI Ultra (Lifetime)	₱9,999	$299.00
super-grok-6m	Super Grok (6m)	₱3,499	$69.00
super-grok-1y	Super Grok (1y)	₱6,999	$120.00
perplexity-pro	Perplexity Pro (1y)	₱2,500	$50.00
perplexity-pro-lifetime	Perplexity Pro (Lifetime)	₱3,999	$80.00
netflix	Netflix (6m)	₱400	$6.70
netflix-1y	Netflix (1y)	₱700	$11.70
cursor-pro-presupplied	Cursor Pro Pre-supplied (Lifetime)	₱6,999	$116.80
cursor-pro-own-6m	Cursor Pro Own (6m)	₱4,999	$83.40
cursor-pro-own-1y	Cursor Pro Own (1y)	₱8,999	$150.20
cursor-pro-plus-own-6m	Cursor Pro+ Own (6m)	₱9,999	$166.80
cursor-pro-plus-own-1y	Cursor Pro+ Own (1y)	₱18,999	$317.00
cursor-ultra-own-6m	Cursor Ultra Own (6m)	₱19,999	$333.70
cursor-ultra-own-1y	Cursor Ultra Own (1y)	₱35,999	$600.70
adobe-cc-pro-3m	Adobe CC Pro (3m)	₱999	$16.70
adobe-cc-pro-6m	Adobe CC Pro (6m)	₱1,799	$30.00
adobe-cc-pro-1y	Adobe CC Pro (1y)	₱2,499	$41.70
capcut-pro-1y	CapCut Pro (1y)	₱699	$11.70
figma-edu	Figma EDU (1y)	₱500	$8.30
office-365-lifetime	Office 365 (Lifetime)	₱1,000	$16.70
coursera-business-1m	Coursera Business (1m)	₱699	$11.70
"""

lines = raw_data.strip().split('\n')

def get_category_icon(slug):
    if 'chatgpt' in slug: return 'ai-assistant', '/logos/chatgpt.png'
    if 'claude' in slug: return 'ai-assistant', '/logos/anthropic.svg'
    if 'google' in slug: return 'ai-assistant', '/logos/google-one.jpeg'
    if 'grok' in slug: return 'ai-assistant', '/logos/x.svg'
    if 'perplexity' in slug: return 'ai-assistant', '/logos/perplexity.svg'
    if 'cursor' in slug: return 'developer', '/logos/cursor.svg'
    if 'netflix' in slug: return 'streaming', '/logos/netflix.svg'
    if 'adobe' in slug: return 'design', '/logos/adobe.svg'
    if 'capcut' in slug: return 'video', '/logos/capcut.svg'
    if 'figma' in slug: return 'design', '/logos/figma.svg'
    if 'office' in slug: return 'productivity', '/logos/office.svg'
    if 'coursera' in slug: return 'productivity', '/logos/coursera.svg'
    return 'software', '/logos/default.svg'

output = []
output.append('import type { Product } from "./types";')
output.append('')
output.append('const DEFAULT_CREATED_AT = new Date("2026-03-27T00:00:00.000Z");')
output.append('')
output.append('export const legacyBoostingSlugs = [')
output.append('  "facebook-followers-low-quality",')
output.append('  "facebook-followers-high-quality",')
output.append('  "facebook-react-low-quality",')
output.append('  "facebook-react-high-quality",')
output.append('  "facebook-post-share",')
output.append('  "facebook-video-reels-views",')
output.append('] as const;')
output.append('')
output.append('export const seedProducts: Product[] = [')

for i, line in enumerate(lines):
    parts = line.split('\t')
    if len(parts) < 4: continue
    slug = parts[0]
    name = parts[1]
    usdt = parts[3].replace('$', '').replace(',', '')
    cat, icon = get_category_icon(slug)
    
    # deterministic uuid based on index
    idx_hex = f"{i+1:012x}"
    uid = f"00000000-0000-0000-0000-{idx_hex}"
    
    output.append('  {')
    output.append(f'    id: "{uid}",')
    output.append(f'    name: "{name}",')
    output.append(f'    slug: "{slug}",')
    output.append(f'    price: "{usdt}",')
    output.append(f'    category: "{cat}",')
    output.append(f'    description: "Premium access to {name}.",')
    output.append(f'    iconUrl: "{icon}",')
    output.append(f'    isActive: true,')
    output.append(f'    createdAt: DEFAULT_CREATED_AT,')
    output.append('  },')

output.append('];')

with open('packages/db/src/seed-products.ts', 'w') as f:
    f.write('\n'.join(output) + '\n')

