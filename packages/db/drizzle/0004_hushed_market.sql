DO $$
BEGIN
  CREATE TYPE "public"."order_access_plan" AS ENUM('one_year', 'lifetime');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "access_plan" "public"."order_access_plan" DEFAULT 'one_year' NOT NULL;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "unit_price" numeric(10, 2);

UPDATE "order_items" AS "oi"
SET "unit_price" = "p"."price"
FROM "products" AS "p"
WHERE "p"."id" = "oi"."product_id"
  AND "oi"."unit_price" IS NULL;

ALTER TABLE "order_items" ALTER COLUMN "unit_price" SET NOT NULL;
