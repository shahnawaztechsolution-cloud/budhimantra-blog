CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"seo_title" text,
	"seo_description" text,
	"keywords" text,
	"status" text DEFAULT 'published' NOT NULL,
	"published_date" timestamp DEFAULT now(),
	"created_date" timestamp DEFAULT now(),
	"updated_date" timestamp DEFAULT now(),
	"views" integer DEFAULT 0,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"topic" text,
	"status" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"error" text,
	"retry_status" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_status" boolean DEFAULT true,
	"posting_mode" text DEFAULT 'automatic',
	"daily_limit" integer DEFAULT 3,
	"categories" json,
	"ai_settings" json,
	"seo_settings" json
);
