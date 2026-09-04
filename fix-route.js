const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

const target = `router.get("/articles", async (req, res) => {
  try {
    const allArticles = await db.select().from(articles).orderBy(desc(articles.publishedDate));
    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});`;

const replacement = `router.get("/articles", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const allArticles = await db.select()
      .from(articles)
      .orderBy(desc(articles.publishedDate))
      .limit(limit)
      .offset(offset);
      
    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('src/api/index.ts', code);
