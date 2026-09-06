import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import { runAgentTask } from "./src/agent/index.js";
import apiRoutes from "./src/api/index.js";
import { initDb } from "./src/db/index.js";
import fs from "fs";

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

  // Dynamic Open Graph (OG) Tags for Social Media Sharing (WhatsApp, Facebook, etc.)
  app.get("/article/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { db } = await import("./src/db/index.js");
      const { articles } = await import("./src/db/schema.js");
      const { eq } = await import("drizzle-orm");

      const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
      
      if (!article) {
        return next();
      }

      let template = "";
      // Depending on env, read the correct index.html
      const isProd = process.env.NODE_ENV === "production";
      const htmlPath = isProd ? path.join(process.cwd(), 'dist', 'index.html') : path.join(process.cwd(), 'index.html');
      
      try {
        template = fs.readFileSync(htmlPath, "utf-8");
      } catch (err) {
        return next();
      }

      const title = article.seoTitle || article.title;
      const cleanDesc = article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : "Buddhimantra Blog - Viral Stories";
      const description = article.seoDescription || cleanDesc;
      const image = article.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
      const currentUrl = `https://${req.get('host')}/article/${slug}`;

      const ogTags = `
        <title>${title}</title>
        <meta name="description" content="${description}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:url" content="${currentUrl}">
        <meta property="og:type" content="article">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${image}">
      `;

      // Replace existing title and generic meta tags if needed, or simply inject before </head>
      let html = template
        .replace(/<title>.*?<\/title>/g, '') // Remove existing title
        .replace('</head>', ogTags + '</head>');
        
      if (!isProd && app.locals.vite) {
         html = await app.locals.vite.transformIndexHtml(req.url, html);
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
      console.error("OG Tag injection error:", error);
      next();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.locals.vite = vite;
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
