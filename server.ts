import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import { runAgentTask } from "./src/agent/index.js";
import apiRoutes from "./src/api/index.js";
import { initDb } from "./src/db/index.js";

async function startServer() {
  // Ensure DB tables exist on startup
  await initDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.use("/api", apiRoutes);

  // SEO: Robots.txt & Dynamic Sitemap for Google Search Console
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: https://${req.get('host')}/sitemap.xml`);
  });

  // Keep-Alive Ping to prevent Render Sleep Mode
  cron.schedule("*/5 * * * *", () => {
    console.log("[Keep-Alive] Pinging server to prevent sleep mode...");
    fetch("https://ntra-blog.onrender.com/").catch(() => {});
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { db } = await import("./src/db/index.js");
      const { articles } = await import("./src/db/schema.js");
      const { eq } = await import("drizzle-orm");
      
      const allArticles = await db.select().from(articles).where(eq(articles.status, "published"));
      const host = `https://${req.get('host')}`;
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Homepage
      xml += `  <url>\n    <loc>${host}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      
      // Articles
      for (const article of allArticles) {
        xml += `  <url>\n    <loc>${host}/article/${article.slug}</loc>\n    <lastmod>${new Date(article.publishedDate).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
      
      xml += `</urlset>`;
      res.type("application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).end();
    }
  });

  // Background Agent Cron Job
  // "Big Blogger" Schedule: Runs 3 times a day (Morning, Afternoon, Evening)
  // 8 AM, 2 PM, 8 PM (Skips the night completely)
  cron.schedule("0 8,14,20 * * *", async () => {
    console.log("Running scheduled AI agent task (Daytime only)...");
    await runAgentTask();
  }, {
    timezone: "Asia/Kolkata"
  });
  
  // Kick off agent loop once on startup (non-blocking)
  setTimeout(() => {
    runAgentTask().catch(console.error);
  }, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
