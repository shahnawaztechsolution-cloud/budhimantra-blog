import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

import * as schema from './schema.js';

// Setup connection pool
export const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.SQL_HOST || '127.0.0.1',
        port: parseInt(process.env.SQL_PORT || '5432'),
        user: process.env.SQL_USER || 'postgres',
        password: process.env.SQL_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'postgres',
      }
);

export const db = drizzle(pool, { schema });

export async function initDb() {
  try {
    console.log("[DB] Initializing database tables if not exist...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
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
        "views" integer DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "task" text NOT NULL,
        "topic" text,
        "status" text NOT NULL,
        "date" timestamp DEFAULT now(),
        "error" text,
        "retry_status" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "agent_status" boolean DEFAULT true,
        "posting_mode" text DEFAULT 'automatic',
        "daily_limit" integer DEFAULT 3,
        "categories" json,
        "ai_settings" json,
        "seo_settings" json
      );
    `);

    // Check if settings table has row
    const settingsRes = await pool.query('SELECT id FROM "settings" LIMIT 1');
    if (settingsRes.rowCount === 0) {
      const defaultCategories = JSON.stringify([
        "Health & Wellness",
        "Technology",
        "Finance & Money",
        "Self Improvement",
        "Business & Startups"
      ]);
      await pool.query(`
        INSERT INTO "settings" ("agent_status", "posting_mode", "daily_limit", "categories")
        VALUES (true, 'automatic', 3, $1::json)
      `, [defaultCategories]);
      console.log("[DB] Default settings created.");
    }

    // Seed 2 initial articles if empty
    const articlesRes = await pool.query('SELECT id FROM "articles" LIMIT 1');
    if (articlesRes.rowCount === 0) {
      await pool.query(`
        INSERT INTO "articles" ("title", "slug", "content", "category", "image_url", "seo_title", "seo_description", "keywords", "status")
        VALUES 
        (
          '2026 में Artificial Intelligence से अपनी Productivity 10x कैसे बढ़ाएं?',
          'ai-productivity-tips-2026',
          '# 2026 में Artificial Intelligence से अपनी Productivity 10x कैसे बढ़ाएं?\\n\\nआज के डिजिटल युग में AI (Artificial Intelligence) सिर्फ एक buzzword नहीं, बल्कि दैनिक जीवन और करियर में आगे बढ़ने का सबसे शक्तिशाली साधन बन चुका है।\\n\\n## 1. स्मार्ट वर्कफ्लो का निर्माण\\nAI टूल्स जैसे चैटबॉट्स और ऑटोमेशन ऐप्स आपके घंटों के काम को मिनटों में बदल सकते हैं। डेटा एनालिसिस, ईमेल ड्राफ्टिंग और रिसर्च में AI का उपयोग करके आप अपना कीमती समय बचा सकते हैं।\\n\\n## 2. सही टूल्स का चुनाव\\nहर काम के लिए अलग टूल की जरूरत होती है। कंटेंट के लिए लैंग्वेज मॉडल्स और विजुअल्स के लिए इमेज जनरेटर्स का सही तालमेल बनाएं।\\n\\n## निष्कर्ष\\nAI इंसानों की जगह नहीं लेगा, लेकिन AI का इस्तेमाल करने वाले लोग उन लोगों से आगे निकल जाएंगे जो इससे बचते हैं। आज ही शुरुआत करें!',
          'Technology',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          '2026 AI Productivity Tips - Buddhimantra',
          'AI से अपनी प्रोडक्टिविटी 10 गुना बढ़ाने के आसान और असरदार तरीके।',
          'AI, Technology, Productivity, 2026',
          'published'
        ),
        (
          'फाइनेंशियल फ्रीडम के 5 सुनहरे नियम: कम उम्र में अमीर बनने का सही रास्ता',
          'financial-freedom-rules-hindi',
          '# फाइनेंशियल फ्रीडम के 5 सुनहरे नियम\\n\\nआर्थिक आजादी केवल ज्यादा कमाने से नहीं, बल्कि कमाए हुए पैसे को सही दिशा में निवेश करने से मिलती है।\\n\\n## 1. 50-30-20 का बजट नियम\\nअपनी आय का 50% जरूरतों पर, 30% इच्छाओं पर और 20% अनिवार्य रूप से बचत व निवेश में लगाएं।\\n\\n## 2. इमरजेंसी फंड\\nकम से कम 6 महीने के खर्च के बराबर इमरजेंसी फंड हमेशा लिक्विड रूप में रखें।\\n\\n## निष्कर्ष\\nपैसा कमाना एक कला है और उसे बढ़ाना एक विज्ञान। अनुशासन ही वित्तीय स्वतंत्रता की कुंजी है।',
          'Finance & Money',
          'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
          'Financial Freedom Tips in Hindi - Buddhimantra',
          'फाइनेंशियल फ्रीडम पाने और सही बजट बनाने के 5 असरदार नियम।',
          'Finance, Money, Investment, Wealth',
          'published'
        );
      `);
      console.log("[DB] Seed articles created.");
    }

    console.log("[DB] Database initialization complete.");
  } catch (err) {
    console.error("[DB] Initialization error:", err);
  }
}
