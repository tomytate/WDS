import fs from "node:fs/promises"
import path from "node:path"

const TARGET_LOGOS = [
  "Next.js",
  "React",
  "TypeScript",
  "TailwindCSS",
  "Supabase",
  "Bun",
  "Cloudflare",
  "GitHub",
]

async function main() {
  const res = await fetch("https://api.github.com/repos/SAWARATSUKI/KawaiiLogos/git/trees/main?recursive=1")
  const data = await res.json()
  
  if (!data.tree) {
    console.error("No tree found in response")
    process.exit(1)
  }

  const outDir = path.join(process.cwd(), "apps", "web", "public", "logos", "kawaii")
  await fs.mkdir(outDir, { recursive: true })

  for (const target of TARGET_LOGOS) {
    // Find the right PNG inside the tree. Usually under `name/name.png` or `name.png`
    const match = data.tree.find((item: any) => 
      item.type === "blob" && 
      item.path.toLowerCase().includes(target.toLowerCase()) && 
      item.path.endsWith(".png")
    )

    if (match) {
      const rawUrl = `https://raw.githubusercontent.com/SAWARATSUKI/KawaiiLogos/main/${match.path}`
      console.log(`Downloading ${target} from ${rawUrl}`)
      const imgRes = await fetch(rawUrl)
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer()
        const savePath = path.join(outDir, `${target}.png`)
        await fs.writeFile(savePath, Buffer.from(buffer))
        console.log(`Saved -> ${savePath}`)
      } else {
        console.error(`Failed to download ${target}: ${imgRes.statusText}`)
      }
    } else {
      console.warn(`Could not find ${target} in repository tree.`)
    }
  }
}

main().catch(console.error)
