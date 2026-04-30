ALTER TABLE "order_items" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;
ALTER TABLE "order_items" ADD COLUMN "service_option" text;
