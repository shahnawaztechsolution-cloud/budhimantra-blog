const fs = require('fs');
let code = fs.readFileSync('src/agent/index.ts', 'utf8');
code = code.replace(`    timeout: 120000\n  } // 120 seconds timeout\n  }\n});`, `    timeout: 120000 // 120 seconds timeout\n  }\n});`);
fs.writeFileSync('src/agent/index.ts', code);
