const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importTarget = `import { initDb } from "./src/db/index.js";`;
const importReplacement = `import { initDb } from "./src/db/index.js";\nimport fs from "fs";`;

const viteMiddlewareTarget = `  // Vite middleware for development`;
const viteMiddlewareReplacement = `  // Dynamic Open Graph (OG) Tags for Social Media Sharing (WhatsApp, Facebook, etc.)
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
      const currentUrl = \`https://\${req.get('host')}/article/\${slug}\`;

      const ogTags = \`
        <title>\${title}</title>
        <meta name="description" content="\${description}">
        <meta property="og:title" content="\${title}">
        <meta property="og:description" content="\${description}">
        <meta property="og:image" content="\${image}">
        <meta property="og:url" content="\${currentUrl}">
        <meta property="og:type" content="article">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="\${title}">
        <meta name="twitter:description" content="\${description}">
        <meta name="twitter:image" content="\${image}">
      \`;

      // Replace existing title and generic meta tags if needed, or simply inject before </head>
      let html = template
        .replace(/<title>.*?<\\/title>/g, '') // Remove existing title
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

  // Vite middleware for development`;

code = code.replace(importTarget, importReplacement);
code = code.replace(viteMiddlewareTarget, viteMiddlewareReplacement);

// We need to attach vite to app.locals so the above works in dev
const devViteTarget = `    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);`;
const devViteReplacement = `    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.locals.vite = vite;
    app.use(vite.middlewares);`;
code = code.replace(devViteTarget, devViteReplacement);

fs.writeFileSync('server.ts', code);
console.log("server.ts updated with OG tags!");
