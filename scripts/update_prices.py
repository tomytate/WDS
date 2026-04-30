import re

updates = {
    # YouTube Real
    "yt-monetize-1": 9.99, "yt-monetize-2": 20.99, "yt-monetize-3": 39.99, "yt-monetize-4": 79.99,
    "yt-monetize-5": 189.99, "yt-monetize-6": 364.99, "yt-monetize-7": 529.99, "yt-monetize-8": 694.99,

    # Premium HQ
    # FB
    "fb-premium-1": 4.99, "fb-premium-2": 9.99, "fb-premium-3": 19.99, "fb-premium-4": 44.99,
    "fb-premium-5": 104.99, "fb-premium-6": 199.99,
    # IG
    "ig-premium-1": 4.99, "ig-premium-2": 9.99, "ig-premium-3": 19.99, "ig-premium-4": 44.99,
    "ig-premium-5": 104.99, "ig-premium-6": 199.99,
    # TikTok
    "tk-premium-1": 9.99, "tk-premium-2": 29.99, "tk-premium-3": 64.99, "tk-premium-4": 154.99,
    "tk-premium-5": 284.99, "tk-premium-6": 519.99,
    # X
    "x-premium-1": 7.99, "x-premium-2": 19.99, "x-premium-3": 39.99, "x-premium-4": 79.99,
    "x-premium-5": 189.99, "x-premium-6": 349.99,
    # TG
    "tg-premium-1": 29.99, "tg-premium-2": 69.99, "tg-premium-3": 134.99, "tg-premium-4": 259.99,
    "tg-premium-5": 499.99, "tg-premium-6": 949.99,
    # Spotify
    "sp-premium-1": 89.99, "sp-premium-2": 199.99, "sp-premium-3": 354.99, "sp-premium-4": 614.99,
    "sp-premium-5": 1324.99, "sp-premium-6": 2200.00,

    # BOT
    # FB
    "fb-bot-1": 1.99, "fb-bot-2": 4.99, "fb-bot-3": 8.99, "fb-bot-4": 16.99, "fb-bot-5": 40.99, "fb-bot-6": 77.00,
    # IG
    "ig-bot-1": 1.99, "ig-bot-2": 4.99, "ig-bot-3": 8.99, "ig-bot-4": 16.99, "ig-bot-5": 40.99, "ig-bot-6": 77.00,
    # TikTok
    "tk-bot-1": 4.99, "tk-bot-2": 13.99, "tk-bot-3": 25.99, "tk-bot-4": 69.99, "tk-bot-5": 113.99, "tk-bot-6": 209.99,
    # YouTube
    "yt-bot-1": 1.99, "yt-bot-2": 7.99, "yt-bot-3": 14.99, "yt-bot-4": 29.99, "yt-bot-5": 74.99, "yt-bot-6": 149.99,
    # TG
    "tg-bot-1": 2.99, "tg-bot-2": 4.99, "tg-bot-3": 9.99, "tg-bot-4": 19.99, "tg-bot-5": 39.99, "tg-bot-6": 79.99,
}

file_path = "w:/Documents/WDS/packages/db/src/growth-packages.ts"
lines = open(file_path, "r", encoding="utf-8").read().splitlines()
active_slug = None
updates_made = 0

for i, line in enumerate(lines):
    if 'slug: "' in line:
        active_slug = line.split('slug: "')[1].split('"', 1)[0]
    elif 'price:' in line and active_slug in updates:
        lines[i] = re.sub(r'price:\s*[\d.]+', f"price: {updates[active_slug]}", line)
        active_slug = None
        updates_made += 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines) + "\n")

print(f"Updates made: {updates_made}")
