import { closeDb, getDb } from "../packages/db/src/client"
import { orders, orderItems, customers } from "../packages/db/src/schema"

async function resetStore() {
  console.log("Initializing database connection...")
  const db = getDb()

  console.log("Purging Order Items...")
  await db.delete(orderItems)

  console.log("Purging Orders...")
  await db.delete(orders)

  console.log("Purging Customers...")
  await db.delete(customers)

  console.log("Database transaction tables reset successfully. Admin and Catalog remain intact.")
  await closeDb()
}

resetStore().catch((err) => {
  console.error("Reset failed:", err)
  process.exit(1)
})
