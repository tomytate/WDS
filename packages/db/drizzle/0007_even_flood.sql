ALTER TABLE "orders" ADD COLUMN "total_price" numeric(10,2) DEFAULT '0.00' NOT NULL;
ALTER TABLE "order_items" ADD COLUMN "target_url" text;

UPDATE "orders"
SET "total_price" = COALESCE((
  SELECT COALESCE(SUM("order_items"."unit_price"), 0)
  FROM "order_items"
  WHERE "order_items"."order_id" = "orders"."id"
), 0) + COALESCE("orders"."tip_amount", 0);

ALTER TABLE "orders" DROP COLUMN "product_id";
