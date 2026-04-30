import { listActiveProducts } from "@wongdigital/db/storefront";

async function main() {
  const products = await listActiveProducts();
  // eslint-disable-next-line no-console
  console.log(`Found ${products.length} products.`);
  if (products.length > 0) {
    // eslint-disable-next-line no-console
    console.log(products[0]);
  }
}

main().catch(console.error);
