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

router.get("/magic-seed", async (req, res) => {
  try {
    const numbers = [3, 4, 5, 7, 10, 11, 21, 50, 99, 100];
    const adjectives = ["खतरनाक", "रहस्यमयी", "अजीबोगरीब", "डरावने", "अमीर", "सुंदर", "प्राचीन", "चमत्कारी", "गुप्त", "विशाल", "अनोखे", "भयानक"];
    const nouns = ["जगहें", "इंसान", "जानवर", "किले", "रहस्य", "देश", "मंदिर", "नियम", "किताबें", "गुफाएं", "नदियां", "ग्रह", "खजाने", "जंगल"];
    const reactions = ["वैज्ञानिक भी हैरान हैं", "कोई नहीं जानता सच", "आप भी कांप जाएंगे", "आज तक नहीं सुलझी पहेली", "अमेरिका भी डरता है", "डॉक्टर भी मानते हैं लोहा", "जिसे देखकर आप यकीन नहीं करेंगे", "आज तक किसी ने नहीं देखा", "विज्ञान के पास भी नहीं है जवाब", "जो रातों-रात वायरल हो गए"];

    const myths = ["एलियंस धरती पर आ चुके हैं", "टाइम ट्रैवल (समय यात्रा) संभव है", "अश्वत्थामा आज भी जिंदा हैं", "2050 में दुनिया खत्म हो जाएगी", "चांद पर कोई नहीं गया था", "पुनर्जन्म होता है", "कैलाश पर्वत पर भगवान शिव रहते हैं", "बरमूडा ट्रायंगल में दूसरी दुनिया का रास्ता है", "इंसानों से पहले डायनासोर नहीं, एलियंस रहते थे", "महाभारत में परमाणु हथियारों का इस्तेमाल हुआ था", "समुद्र के नीचे एक और दुनिया है", "हम सब एक सिमुलेशन में जी रहे हैं"];
    const experts = ["नासा (NASA)", "दुनिया के टॉप वैज्ञानिकों", "इतिहासकारों", "हार्वर्ड के प्रोफेसरों", "प्राचीन ग्रंथों", "एलोन मस्क", "स्टीफन हॉकिंग", "रूस की सीक्रेट एजेंसी", "खुफिया एजेंसियों", "डॉक्टरों"];

    const goals = ["रातों-रात करोड़पति कैसे बनें", "1 महीने में 10 किलो वजन कैसे कम करें", "बिना जिम जाए बॉडी कैसे बनाएं", "शेयर बाजार से लाखों कैसे कमाएं", "कंप्यूटर से भी तेज दिमाग कैसे पाएं", "कैंसर जैसी बीमारियों से कैसे बचें", "अपनी किस्मत कैसे बदलें", "बुढ़ापे को कैसे रोकें", "इंटरनेट से पैसे कैसे छापें"];
    const secrets = ["5 अचूक तरीके", "जापानी सीक्रेट", "चाणक्य की नीतियां", "वॉरेन बफे का सीक्रेट रूल", "10 जादुई टिप्स", "प्राचीन आयुर्वेद का सच", "5 गोल्डन रूल्स", "अमीर लोगों का सबसे बड़ा राज", "7 चमत्कारी उपाय"];

    const categories = ["रहस्य", "इतिहास", "विज्ञान", "स्वास्थ्य", "पैसा"];

    const categoryImages = {
      "रहस्य": ["mysterious%20creature%20dark%20forest", "ancient%20alien%20ruins%20glow", "creepy%20abandoned%20asylum", "deep%20ocean%20monster%20shadow", "illuminati%20secret%20society%20meeting"],
      "इतिहास": ["ancient%20indian%20temple%20gold", "epic%20war%20elephants%20battle", "ashoka%20empire%20map", "hidden%20treasure%20cave", "historical%20king%20portrait"],
      "विज्ञान": ["futuristic%20cyborg%20ai", "space%20black%20hole%20galaxy", "time%20machine%20glowing%20portal", "dna%20mutation%20science", "alien%20planet%20landscape"],
      "स्वास्थ्य": ["healthy%20brain%20glowing", "ancient%20ayurveda%20herbs", "meditation%20himalayas%20monk", "gym%20fitness%20transformation", "yoga%20sunrise%20mountain"],
      "पैसा": ["gold%20coins%20falling%20rain", "wall%20street%20bull%20crypto", "luxury%20mansion%20swimming%20pool", "business%20success%20graph", "hacker%20making%20money%20laptop"]
    };

    const contentTemplates = {
      "रहस्य": "दुनिया में कई ऐसे रहस्य हैं जो आज तक अनसुलझे हैं। आज हम जिस विषय पर बात कर रहे हैं, उसने बड़े-बड़े वैज्ञानिकों को भी सोचने पर मजबूर कर दिया है।\n\n## आखिर सच क्या है?\nस्थानीय लोगों और प्राचीन कथाओं के अनुसार इसके पीछे एक बहुत बड़ी और रहस्यमयी शक्ति है। कई बार खोजकर्ताओं ने इसका सच जानने की कोशिश की, लेकिन हर बार उन्हें नाकामी ही हाथ लगी।\n\n* **चौंकाने वाली बात:** हाल ही में मिली कुछ रिपोर्ट्स इशारा करती हैं कि यह कोई इत्तेफाक नहीं है।\n* **इतिहास का पन्ना:** सदियों पुरानी किताबों में भी इस घटना का साफ-साफ जिक्र मिलता है।\n\n## विज्ञान और रहस्य की टक्कर\nवैज्ञानिक इसे एक प्राकृतिक और भौगोलिक घटना मानते हैं, लेकिन उनके पास भी हर सवाल का जवाब नहीं है। क्या हमें कभी इस पहेली का असली जवाब मिल पाएगा? यह आने वाला वक्त ही बताएगा।",
      "पैसा": "आज के समय में हर कोई जल्दी से जल्दी अमीर बनना चाहता है। लेकिन क्या यह इतना आसान है? दुनिया के सबसे सफल लोगों ने कुछ ऐसे सीक्रेट्स बताए हैं, जो आपकी जिंदगी बदल सकते हैं।\n\n## सफलता के अचूक नियम\nअगर आप अपनी आर्थिक स्थिति बदलना चाहते हैं, तो आपको अपने काम करने और सोचने का तरीका बदलना होगा।\n\n* **निवेश की ताकत:** पैसे से पैसा कमाना सीखें, सिर्फ सेविंग से कोई अमीर नहीं बनता।\n* **रिस्क लेना सीखें:** जितने भी लोग करोड़पति बने हैं, उन्होंने सही समय पर सही रिस्क लिया है।\n\n## निष्कर्ष\nआज से ही इन नियमों को अपनी जिंदगी में उतारें। शुरुआत छोटी हो सकती है, लेकिन इसका परिणाम बहुत बड़ा और चमत्कारी होगा। मेहनत और सही दिशा आपको जरूर सफलता दिलाएगी।",
      "विज्ञान": "अंतरिक्ष और विज्ञान की दुनिया इतनी बड़ी है कि हर दिन कुछ नया सामने आता है। आज हम एक ऐसी खोज के बारे में बात करेंगे जिसने पूरी दुनिया में तहलका मचा दिया है।\n\n## नई रिसर्च और खुलासे\nहाल ही में दुनिया के टॉप रिसर्च संस्थानों ने एक रिपोर्ट जारी की है, जो हमारे सोचने के तरीके को पूरी तरह से बदल सकती है। \n\n* **बड़ा बदलाव:** यह तकनीक आने वाले 10 सालों में इंसानी जिंदगी को पूरी तरह बदल देगी।\n* **खतरा या वरदान?** कुछ विशेषज्ञों का मानना है कि इसके कुछ गंभीर परिणाम भी हो सकते हैं, जिसके लिए हमें तैयार रहना होगा।\n\n## भविष्य की तैयारी\nक्या हम इस नए बदलाव के लिए पूरी तरह से तैयार हैं? विज्ञान हमारे जीवन को आसान बना रहा है, लेकिन इसके कुछ अनसुलझे पहलू भी हैं जिन्हें समझना बेहद जरूरी है।",
      "इतिहास": "हमारा इतिहास सिर्फ राजा-महाराजाओं की कहानियों तक सीमित नहीं है। इसमें कई ऐसे गहरे राज दबे हैं, जो आज के समय में भी लोगों को हैरान कर देते हैं।\n\n## प्राचीन वास्तुकला और ज्ञान\nहजारों साल पहले जब कोई आधुनिक मशीन नहीं थी, तब भी हमारे पूर्वजों ने ऐसी-ऐसी चीजें बनाईं जिन्हें आज का विज्ञान भी नहीं बना सकता।\n\n* **अद्भुत कला:** पत्थरों को काटकर बनाए गए ये ढांचे आज भी किसी चमत्कार से कम नहीं लगते।\n* **खोया हुआ ज्ञान:** प्राचीन ग्रंथों में छिपे ज्ञान को अगर आज डिकोड कर लिया जाए, तो दुनिया बदल सकती है।\n\nहमें अपने इतिहास पर गर्व होना चाहिए और इन अनमोल धरोहरों को सुरक्षित रखने का प्रयास करना चाहिए।",
      "स्वास्थ्य": "एक अच्छी सेहत से बढ़कर दुनिया में कोई और खजाना नहीं है। आज की भागदौड़ भरी जिंदगी में हम अपनी सेहत को सबसे ज्यादा नजरअंदाज करते हैं।\n\n## स्वस्थ रहने के मूल मंत्र\nअगर आप लंबी और बीमारियों से मुक्त जिंदगी जीना चाहते हैं, तो अपनी दिनचर्या में कुछ छोटे लेकिन जरूरी बदलाव करें।\n\n* **खान-पान:** प्रकृति से जुड़ी चीजें खाएं, जंक फूड को अपनी थाली से पूरी तरह बाहर निकालें।\n* **व्यायाम और ध्यान:** रोजाना सिर्फ 30 मिनट का व्यायाम और ध्यान आपके शरीर और दिमाग को नई ऊर्जा दे सकता है।\n\n## आयुर्वेद का चमत्कार\nहमारी प्राचीन चिकित्सा पद्धति में हर बीमारी का इलाज मौजूद है। जरूरत है तो बस उसे सही तरीके से अपनाने की। आज से ही एक स्वस्थ जीवनशैली की शुरुआत करें।"
    };

    function rand(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateTitle() {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) return `दुनिया के ${rand(numbers)} सबसे ${rand(adjectives)} ${rand(nouns)}, ${rand(reactions)}`;
      if (type === 1) return `क्या सच में ${rand(myths)}? ${rand(experts)} ने किया चौंकाने वाला खुलासा!`;
      return `${rand(goals)}? जानिए ${rand(experts)} के ये ${rand(secrets)}`;
    }

    const insertData = [];
    for (let i = 0; i < 50; i++) {
      const title = generateTitle();
      const category = categories[Math.floor(Math.random() * categories.length)];
      const randomPrompt = categoryImages[category][Math.floor(Math.random() * categoryImages[category].length)];
      const randomSeed = Math.floor(Math.random() * 1000000); // Random seed for unique images
      const slug = 'viral-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      insertData.push({
        title,
        slug,
        content: contentTemplates[category],
        category,
        imageUrl: `https://image.pollinations.ai/prompt/${randomPrompt}?width=800&height=400&nologo=true&seed=${randomSeed}`,
        seoTitle: title,
        seoDescription: title + " - अनसुने रहस्य",
        keywords: category + ", viral, trending",
        status: "published"
      });
    }

    await db.insert(articles).values(insertData);
    res.send("<h1>Success! 50 new viral articles have been added to the database. Refresh to add 50 more!</h1><br><a href='/'>Go to Home Page</a>");
  } catch (error) {
    res.status(500).send("Error adding articles: " + error.message);
  }
});

router.get("/articles", async (req, res) => {
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

router.post("/articles", authenticate, async (req, res) => {
  try {
    const { title, slug, content, category, imageUrl, seoTitle, seoDescription, keywords } = req.body;
    await db.insert(articles).values({
      title,
      slug,
      content,
      category: category || "General",
      imageUrl,
      seoTitle,
      seoDescription,
      keywords,
      status: "published",
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to create article manually:", error);
    res.status(500).json({ error: "Failed to create article" });
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
