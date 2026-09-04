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
    // Only return top 100 for now to prevent freezing the browser
    const allArticles = await db.select()
      .from(articles)
      .orderBy(desc(articles.publishedDate))
      .limit(100);
      
    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('src/api/index.ts', code);
