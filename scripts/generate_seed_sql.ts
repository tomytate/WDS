import { seedProducts, legacyBoostingSlugs } from "../packages/db/src/seed-products";
import { defaultStoreSettings } from "../packages/db/src/store-config";
import fs from "fs";
import path from "path";

// Generate SQL for products
let sql = `
-- ═══════════════════════════════════════════════════════════════
-- STORE SETTINGS
-- ═══════════════════════════════════════════════════════════════
INSERT INTO store_settings (id, store_name, support_email, qrph_number, qrph_instructions, binance_pay_id, binance_instructions)
VALUES (
  'primary', 
  '${defaultStoreSettings.storeName.replace(/'/g, "''")}', 
  '${defaultStoreSettings.supportEmail.replace(/'/g, "''")}', 
  '${defaultStoreSettings.qrphNumber.replace(/'/g, "''")}', 
  '${defaultStoreSettings.qrphInstructions.replace(/'/g, "''")}', 
  '${defaultStoreSettings.binancePayId.replace(/'/g, "''")}', 
  '${defaultStoreSettings.binanceInstructions.replace(/'/g, "''")}'
) ON CONFLICT (id) DO UPDATE SET 
  store_name = EXCLUDED.store_name,
  support_email = EXCLUDED.support_email,
  qrph_number = EXCLUDED.qrph_number,
  qrph_instructions = EXCLUDED.qrph_instructions,
  binance_pay_id = EXCLUDED.binance_pay_id,
  binance_instructions = EXCLUDED.binance_instructions;

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════
`;

for (const p of seedProducts) {
  // Skip inactive provider-catalog rows — they are only needed for order routing
  // and should NOT appear in the storefront DB as pre-seeded rows.
  if (!p.isActive) continue;

  const name = p.name.replace(/'/g, "''");
  const description = (p.description ?? "").replace(/'/g, "''");
  const is_active = p.isActive ? "true" : "false";
  
  sql += `INSERT INTO products (id, name, slug, price, category, description, icon_url, is_active, created_at)
VALUES (
  '${p.id}', 
  '${name}', 
  '${p.slug}', 
  ${p.price}, 
  '${p.category}', 
  '${description}', 
  ${p.iconUrl ? `'${p.iconUrl}'` : 'NULL'}, 
  ${is_active}, 
  '${p.createdAt.toISOString()}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  is_active = EXCLUDED.is_active;
`;
}

if (legacyBoostingSlugs.length > 0) {
  const slugs = legacyBoostingSlugs.map((s) => `'${s}'`).join(", ");
  sql += `\nUPDATE products SET is_active = false WHERE slug IN (${slugs});\n`;
}

const outPath = path.resolve(process.cwd(), "supabase/seed.sql");
fs.writeFileSync(outPath, sql.trim() + "\n");
console.log("Successfully generated supabase/seed.sql with " + seedProducts.length + " products!");
