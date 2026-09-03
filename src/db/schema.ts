import { pgTable, text, timestamp, integer, boolean, json, serial } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  keywords: text("keywords"),
  status: text("status").notNull().default("published"), // published, draft
  publishedDate: timestamp("published_date").defaultNow(),
  createdDate: timestamp("created_date").defaultNow(),
  updatedDate: timestamp("updated_date").defaultNow(),
  views: integer("views").default(0),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(), // e.g. "Research", "Write Article", "Publish"
  topic: text("topic"),
  status: text("status").notNull(), // success, error
  date: timestamp("date").defaultNow(),
  error: text("error"),
  retryStatus: boolean("retry_status").default(false),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  agentStatus: boolean("agent_status").default(true), // ON/OFF
  postingMode: text("posting_mode").default("automatic"), // automatic, fixed
  dailyLimit: integer("daily_limit").default(3),
  categories: json("categories").$type<string[]>(),
  aiSettings: json("ai_settings"),
  seoSettings: json("seo_settings"),
});
