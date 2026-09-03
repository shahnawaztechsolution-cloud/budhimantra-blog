import { Router } from "express";
import { db } from "../db/index.js";
import { articles, settings, logs } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohdshahnawaz.afaque@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Sh@sahiba9653";
const JWT_SECRET = process.env.JWT_SECRET || "buddhimantra-secret-key-2024";

// Public Routes
router.get("/articles", async (req, res) => {
  try {
    const allArticles = await db.select().from(articles).orderBy(desc(articles.publishedDate));
    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/articles/:slug", async (req, res) => {
  try {
    const article = await db.select().from(articles).where(eq(articles.slug, req.params.slug)).limit(1);
    if (article.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(article[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Admin Authentication
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Admin Routes
router.get("/settings", authenticate, async (req, res) => {
  try {
    const allSettings = await db.select().from(settings).limit(1);
    res.json(allSettings[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.post("/settings", authenticate, async (req, res) => {
  try {
    const { agentStatus, postingMode, dailyLimit, categories } = req.body;
    await db.update(settings).set({
      agentStatus,
      postingMode,
      dailyLimit,
      categories,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

router.get("/logs", authenticate, async (req, res) => {
  try {
    const allLogs = await db.select().from(logs).orderBy(desc(logs.date)).limit(50);
    res.json(allLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
