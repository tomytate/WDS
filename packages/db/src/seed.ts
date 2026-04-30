import { closeDb, getDb, hasDatabaseUrl } from "./client";
import { legacyBoostingSlugs, seedProducts } from "./seed-products";
import { defaultStoreSettings } from "./store-config";

const seedProductRows = seedProducts.map((product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: Number(product.price),
  category: product.category,
  description: product.description,
  icon_url: product.iconUrl,
  is_active: product.isActive,
  created_at: product.createdAt.toISOString(),
}));

async function seedDatabase() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const supabase = getDb();

  await supabase.from("store_settings").upsert(
    {
      id: "primary",
      store_name: defaultStoreSettings.storeName,
      support_email: defaultStoreSettings.supportEmail,
      qrph_number: defaultStoreSettings.qrphNumber,
      qrph_instructions: defaultStoreSettings.qrphInstructions,
      binance_pay_id: defaultStoreSettings.binancePayId,
      binance_instructions: defaultStoreSettings.binanceInstructions,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  for (const row of seedProductRows) {
    await supabase.from("products").upsert(row, { onConflict: "id" });
  }

  await supabase
    .from("products")
    .update({ is_active: false })
    .in("slug", legacyBoostingSlugs);

  console.log(
    `Seeded ${seedProducts.length} products and default store settings.`,
  );
}

if (import.meta.main) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await closeDb();
    });
}
