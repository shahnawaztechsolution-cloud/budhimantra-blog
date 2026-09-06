const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

const target = `    const categoryImages = {
      "रहस्य": "https://image.pollinations.ai/prompt/mysterious%20cinematic%20dark%20ancient%20discovery%20high%20quality?width=800&height=400&nologo=true",
      "इतिहास": "https://image.pollinations.ai/prompt/ancient%20history%20epic%20monuments%20india%20cinematic?width=800&height=400&nologo=true",
      "विज्ञान": "https://image.pollinations.ai/prompt/futuristic%20science%20space%20technology%20cinematic?width=800&height=400&nologo=true",
      "स्वास्थ्य": "https://image.pollinations.ai/prompt/healthy%20lifestyle%20nature%20wellness%20cinematic?width=800&height=400&nologo=true",
      "पैसा": "https://image.pollinations.ai/prompt/wealth%20money%20success%20business%20growth?width=800&height=400&nologo=true"
    };`;

const replacement = `    const categoryImages = {
      "रहस्य": ["mysterious%20creature%20dark%20forest", "ancient%20alien%20ruins%20glow", "creepy%20abandoned%20asylum", "deep%20ocean%20monster%20shadow", "illuminati%20secret%20society%20meeting"],
      "इतिहास": ["ancient%20indian%20temple%20gold", "epic%20war%20elephants%20battle", "ashoka%20empire%20map", "hidden%20treasure%20cave", "historical%20king%20portrait"],
      "विज्ञान": ["futuristic%20cyborg%20ai", "space%20black%20hole%20galaxy", "time%20machine%20glowing%20portal", "dna%20mutation%20science", "alien%20planet%20landscape"],
      "स्वास्थ्य": ["healthy%20brain%20glowing", "ancient%20ayurveda%20herbs", "meditation%20himalayas%20monk", "gym%20fitness%20transformation", "yoga%20sunrise%20mountain"],
      "पैसा": ["gold%20coins%20falling%20rain", "wall%20street%20bull%20crypto", "luxury%20mansion%20swimming%20pool", "business%20success%20graph", "hacker%20making%20money%20laptop"]
    };`;

const loopTarget = `      const title = generateTitle();
      const category = categories[Math.floor(Math.random() * categories.length)];
      const slug = 'viral-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      insertData.push({
        title,
        slug,
        content: contentTemplates[category],
        category,
        imageUrl: categoryImages[category],`;

const loopReplacement = `      const title = generateTitle();
      const category = categories[Math.floor(Math.random() * categories.length)];
      const randomPrompt = categoryImages[category][Math.floor(Math.random() * categoryImages[category].length)];
      const randomSeed = Math.floor(Math.random() * 1000000); // Random seed for unique images
      const slug = 'viral-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      insertData.push({
        title,
        slug,
        content: contentTemplates[category],
        category,
        imageUrl: \`https://image.pollinations.ai/prompt/\${randomPrompt}?width=800&height=400&nologo=true&seed=\${randomSeed}\`,`;

code = code.replace(target, replacement);
code = code.replace(loopTarget, loopReplacement);
fs.writeFileSync('src/api/index.ts', code);
console.log("Images fixed!");
