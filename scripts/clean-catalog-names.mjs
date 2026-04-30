import fs from "fs"
import path from "path"

const TARGET_FILE = "packages/db/src/boosting-service-catalog.generated.ts"
const filePath = path.join(process.cwd(), TARGET_FILE)

const content = fs.readFileSync(filePath, "utf-8")

function cleanName(raw) {
  let name = raw

  // 1. Remove terms that sound cheap or overly technical
  name = name.replace(/ - No Refill/gi, "")
  name = name.replace(/ - Lifetime/gi, " (Lifetime)")
  name = name.replace(/ - Refill (\d+)D/gi, " ($1-Day Guarantee)")
  name = name.replace(/ \[Global\]/gi, "")
  
  // 2. Translate quality tiers to premium terms
  name = name.replace(/ \[High Quality\]/gi, " (Premium)")
  name = name.replace(/ \[Premium\]/gi, " (Premium)")
  name = name.replace(/ \[Real Accounts\]/gi, " (Organic)")
  name = name.replace(/ \[Real\]/gi, " (Organic)")
  name = name.replace(/ \[Old Accounts\]/gi, " (Aged Accounts)")
  name = name.replace(/ \[Old Accts w\/Posts\]/gi, " (Active Aged Accounts)")
  name = name.replace(/ \[Low Quality\]/gi, " (Standard)")
  name = name.replace(/ \[Bot\]/gi, " (Automated)")

  // 3. Fix parens/formatting
  name = name.replace(/\(Custom\)/gi, "(Customized)")
  name = name.replace(/\(Random\)/gi, "(Randomized)")

  // 4. Combine double parens like (Customized) (Premium) -> (Customized, Premium)
  name = name.replace(/\) \(/g, ", ")

  // 5. Cleanup messy emojis or dashes
  name = name.replace(/ - Angry 😡/gi, " (Angry)")
  name = name.replace(/ - Care 🤗/gi, " (Care)")
  name = name.replace(/ - Haha 😆/gi, " (Haha)")
  name = name.replace(/ - Like 👍/gi, " (Like)")
  name = name.replace(/ - Love ❤️/gi, " (Love)")
  name = name.replace(/ - Sad 😢/gi, " (Sad)")
  name = name.replace(/ - Wow 😮/gi, " (Wow)")
  
  name = name.replace(/ - AI Refill/gi, " (AI Sustained)")

  // Final trim
  name = name.replace(/\s+/g, " ").trim()

  return name
}

// Format: [20062, "meta", "facebook", "Facebook Comments (Custom) - No Refill", "slug", ...]
const updatedContent = content.split("\n").map(line => {
  // Capture everything up to the 4th quote (which is the start of the name string)
  // [123, "meta", "facebook", "NAME START
  const match = line.match(/^(\s*\[\d+,\s*"[^"]+",\s*"[^"]+",\s*")([^"]+)((?:",\s*.*))/)
  if (match) {
    const [_, prefix, name, suffix] = match
    const newName = cleanName(name)
    return `${prefix}${newName}${suffix}`
  }
  return line
}).join("\n")

fs.writeFileSync(filePath, updatedContent, "utf-8")
console.log("Cleanup complete")
