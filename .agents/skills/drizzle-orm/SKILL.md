---
description: Drizzle ORM patterns, schema conventions, and query patterns for PostgreSQL/Supabase
---

# Drizzle ORM 0.45.2 — Reference Guide

## Schema Definition

```ts
import { pgTable, text, numeric, boolean, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
```

## Query Patterns

### Select
```ts
const activeProducts = await db
  .select()
  .from(products)
  .where(eq(products.isActive, true))
  .orderBy(products.name)
```

### Insert
```ts
const [newProduct] = await db
  .insert(products)
  .values({ name, slug, price, category })
  .returning()
```

### Upsert
```ts
await db
  .insert(products)
  .values({ id, name, slug, price, category })
  .onConflictDoUpdate({
    target: products.id,
    set: { name, slug, price, category, updatedAt: new Date() },
  })
```

### Relational Queries (Drizzle Query API)
```ts
const ordersWithItems = await db.query.orders.findMany({
  with: {
    items: {
      with: {
        product: true,
      },
    },
  },
  where: eq(orders.customerEmail, email),
  orderBy: desc(orders.createdAt),
})
```

## Migration Commands
```bash
bun run db:generate  # Generate SQL migration from schema changes
bun run db:migrate   # Apply pending migrations
bun run db:seed      # Seed database with initial data
```

## Connection Pattern

```ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

## Best Practices
1. **Always use `.returning()`** after insert/update to get the created/updated row
2. **Use `uuid().defaultRandom()`** for primary keys — no sequential ID leaks
3. **Use `timestamp({ withTimezone: true })`** — always store UTC timestamps
4. **Use `numeric({ precision: 10, scale: 2 })`** for prices — never use `float`
5. **Use relational queries** (`db.query.*.findMany`) for complex joins instead of raw SQL
