import { db } from "../db/index.js";
import { articles, logs, settings } from "../db/schema.js";
import { GoogleGenAI } from "@google/genai";
import slugify from "slugify";
import { gte, sql, desc } from "drizzle-orm";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
    timeout: 60000 // 60 seconds timeout
  }
});

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateWithRetry(model: string, contents: string, isJson: boolean, maxRetries = 5, initialBackoff = 15000): Promise<any> {
  let backoff = initialBackoff;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: isJson ? { responseMimeType: "application/json" } : undefined
      });
      return response;
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      // 429: Too Many Requests (Quota Exceeded), 503: Service Unavailable (High Demand)
      if ((status === 429 || status === 503) && i < maxRetries - 1) {
        console.warn(`[Agent] API Limit or High Demand (status ${status}). Waiting ${backoff / 1000}s before retry... (Attempt ${i + 1}/${maxRetries})`);
        await delay(backoff);
        backoff *= 1.5; // Exponential backoff: 15s, 22.5s, 33.7s, 50s...
      } else {
        throw err;
      }
    }
  }
}

async function logActivity(task: string, topic: string | null, status: string, error?: string) {
  await db.insert(logs).values({
    task,
    topic,
    status,
    error: error ? error.substring(0, 500) : null,
  });
}

export async function runAgentTask() {
  try {
    const config = await db.select().from(settings).limit(1);
    if (!config || config.length === 0) return;
    const currentSettings = config[0];

    if (!currentSettings.agentStatus) {
      console.log("Agent is disabled in settings.");
      return;
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const publishedToday = await db.select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(gte(articles.publishedDate, today));

    if (publishedToday[0].count >= (currentSettings.dailyLimit || 3)) {
      console.log("Daily limit reached.");
      return;
    }

    // Check time gap since last article to avoid spamming on server restarts
    const lastArticle = await db.select({ publishedDate: articles.publishedDate })
      .from(articles)
      .orderBy(desc(articles.publishedDate))
      .limit(1);
    
    if (lastArticle.length > 0 && lastArticle[0].publishedDate) {
      const hoursSinceLast = (new Date().getTime() - new Date(lastArticle[0].publishedDate).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 4) { // Minimum 4 hours gap between articles
        console.log(`Skipping agent run: Last article was published only ${hoursSinceLast.toFixed(1)} hours ago.`);
        return;
      }
    }

    await logActivity("Research & Write", null, "started");

    // Fetch recently written topics to avoid duplicates
    const recentArticles = await db.select({ title: articles.title })
      .from(articles)
      .orderBy(desc(articles.publishedDate))
      .limit(20);
    const recentTitles = recentArticles.map(a => a.title).join(", ");

    // 1. Pick a category
    const categories = (currentSettings.categories as string[]) || ["सामान्य ज्ञान"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // 2. Generate Topic & Outline
    const topicPrompt = `
      तुम "BUDHIMANTRA — DAILY VIRAL BLOG AGENT" हो।
      तुम्हारा काम हर दिन ऐसा ORIGINAL और HIGH-VALUE article तैयार करना है जिसे लोग पढ़ना चाहें, share करें और Google Search/Discover से traffic आने की संभावना हो।
      
      आज के लिए तुम्हें इस Category में से एक बेहतरीन Topic खोजना है: "${randomCategory}"

      नियम (RULES FOR TOPIC SELECTION):
      1. टॉपिक ऐसा हो जिसमें curiosity हो, लोग सवाल पूछ रहे हों, और जिसका title देखकर reader क्लिक करना चाहे।
      2. सिर्फ इसलिए article मत बनाओ क्योंकि कोई topic viral है। अगर पर्याप्त reliable information नहीं है, तो उसे छोड़कर दूसरा topic चुनो।
      3. News को छोड़कर Evergreen / Knowledge / Fact आधारित टॉपिक चुनो।
      4. CRITICAL RULE: इन पिछले लिखे गए articles से मिलता-जुलता कोई topic मत चुनना: [${recentTitles}]
      
      Provide ONLY a JSON object with this structure:
      {
        "title": "SEO friendly Hindi title (आकर्षक हो, curiosity पैदा करे लेकिन clickbait न हो)",
        "english_keyword": "A short english keyword for image search",
        "seo_description": "Short description for meta tag (Hindi)"
      }
    `;

    const topicResponse = await generateWithRetry(
      "gemini-3.6-flash",
      topicPrompt,
      true
    );

    const topicData = JSON.parse(topicResponse.text || "{}");
    if (!topicData.title) throw new Error("Failed to generate topic");

    // 3. Write Article
    const articlePrompt = `
      तुम "BUDHIMANTRA — DAILY VIRAL BLOG AGENT" हो।
      तुम्हें नीचे दिए गए Topic पर एक बहुत ही शानदार, original और high-value article लिखना है।
      
      Topic: "${topicData.title}"

      INSTRUCTIONS / नियम:
      1. **Style**: आसान और Natural Hindi का इस्तेमाल करो। छोटे paragraphs, आसान examples, और जरूरत के अनुसार English terms का इस्तेमाल करो।
      2. **Structure**: 
         - शुरुआत में ही reader की curiosity बनाए रखो (Introduction).
         - असली वजह/जानकारी को Detail में समझाओ (Latest facts और ताज़ा आंकड़ों का इस्तेमाल करो).
         - क्या कहती है Research? (Facts verify करके लिखो).
         - उदाहरण (Real-life example दो).
         - निष्कर्ष (Conclusion).
         - **FAQ Section**: निष्कर्ष के बाद कम से कम 3-4 ऐसे FAQs (Frequently Asked Questions) जोड़ो जो लोग असल में Google पर सर्च करते हैं (जैसे: 'क्या सच में...?', 'वजह क्या है...?').
         - **Call to Action (CTA)**: आर्टिकल के एकदम आखिर में readers से एक दिलचस्प सवाल पूछो ताकि वे comment/share करने के लिए प्रेरित हों (उदा: "आपका इस बारे में क्या सोचना है? नीचे कमेंट करके जरूर बताएं!").
         - Headings के लिए Markdown (##, ###) का इस्तेमाल करो।
      3. **Quality & Value**: Information को copy मत करो। आसान explanation, comparison, context, और practical takeaway जैसी Original Value जोड़ो। AI-generated nonsense या Fake news बिल्कुल न हो।
      4. **SEO & Keywords**: Keyword Stuffing मत करो, लेकिन मुख्य Keyword के साथ-साथ LSI (मिलते-जुलते) Keywords का naturally इस्तेमाल करो ताकि Google Search/Discover में आर्टिकल रैंक करे।
      5. **Length**: 800–1500 शब्दों का detailed article लिखो। Topic जितना मांगता है उतना ही लिखो।

      Return ONLY the markdown content of the article. Do not include JSON. Start directly with the # H1 Title.
    `;

    const articleResponse = await generateWithRetry(
      "gemini-3.6-flash",
      articlePrompt,
      false
    );

    const content = articleResponse.text;
    if (!content) throw new Error("Failed to generate content");

    // 4. Save to DB
    // Using Pollinations.ai for FREE, Lifetime, API-Key-less highly relevant AI-generated images
    const safeKeyword = encodeURIComponent((topicData.english_keyword || "blog") + " high quality realistic photography");
    const imageUrl = `https://image.pollinations.ai/prompt/${safeKeyword}?width=800&height=400&nologo=true`;

    const slug = slugify(topicData.english_keyword || "article", { lower: true, strict: true }) + "-" + Date.now();

    await db.insert(articles).values({
      title: topicData.title,
      slug,
      content,
      category: randomCategory,
      imageUrl,
      seoTitle: topicData.title,
      seoDescription: topicData.seo_description,
      keywords: topicData.english_keyword,
      status: "published"
    });

    await logActivity("Publish Article", topicData.title, "success");
    console.log("Agent published article:", topicData.title);

  } catch (error: any) {
    console.error("Agent Task Error:", error);
    await logActivity("Agent Execution", null, "error", error.message);
  }
}
