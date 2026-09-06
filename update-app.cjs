const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";`;
const importReplacement = `import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";\nimport InstallPwa from "./components/InstallPwa";`;

const componentTarget = `        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}`;

const componentReplacement = `        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <InstallPwa />
      </div>
    </Router>
  );
}`;

code = code.replace(importTarget, importReplacement);
code = code.replace(componentTarget, componentReplacement);
fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx updated!");
