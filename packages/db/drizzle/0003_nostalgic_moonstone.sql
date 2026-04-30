CREATE TABLE "store_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"store_name" text NOT NULL,
	"support_email" text NOT NULL,
	"gcash_number" text NOT NULL,
	"gcash_qr_instructions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
