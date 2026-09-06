const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import InstallPwa from "./components/InstallPwa";`;
const importReplacement = `import InstallPwa from "./components/InstallPwa";\nimport NewsletterPopup from "./components/NewsletterPopup";`;

const componentTarget = `        <InstallPwa />
      </div>
    </Router>
  );
}`;

const componentReplacement = `        <InstallPwa />
        <NewsletterPopup />
      </div>
    </Router>
  );
}`;

code = code.replace(importTarget, importReplacement);
code = code.replace(componentTarget, componentReplacement);
fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx updated again!");
