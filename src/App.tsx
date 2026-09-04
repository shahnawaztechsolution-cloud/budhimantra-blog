import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { format } from "date-fns";

// --- Types ---
type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  imageUrl: string;
  publishedDate: string;
  views: number;
};

// --- Components ---

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-900">बुद्धिमंत्र ज्ञान</Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
          <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin Panel</Link>
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, []);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">हर दिन कुछ नया सीखें</h1>
        <p className="text-xl text-gray-600">विज्ञान, इतिहास, तकनीक और रोचक तथ्यों की दुनिया।</p>
        
        <div className="mt-8 max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder="आर्टिकल्स खोजें... (जैसे: इतिहास, AI, तकनीक)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-sm"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading articles...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">कोई लेख नहीं मिला।</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <Link key={article.id} to={`/article/${article.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">{article.category}</span>
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h2>
                <div className="mt-auto pt-4 flex items-center text-sm text-gray-500">
                  <span>{format(new Date(article.publishedDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data.error ? null : data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!article) return <div className="text-center py-20">Article not found</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        वापस होम पेज पर जाएँ
      </Link>
      
      <div className="mb-8 text-center">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{article.category}</span>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-4 mb-6 leading-tight">{article.title}</h1>
        <div className="text-gray-500 flex items-center justify-center gap-4 text-sm mb-6">
          <span>{format(new Date(article.publishedDate), 'MMMM d, yyyy')}</span>
          <span>•</span>
          <span>बुद्धिमंत्र टीम</span>
        </div>
        
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  text: 'इसे ज़रूर पढ़ें! बुद्धिमंत्र ज्ञान पर एक अद्भुत जानकारी:',
                  url: window.location.href,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("लिंक कॉपी हो गया!");
              }
            }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            दोस्तों के साथ शेयर करें
          </button>
        </div>
      </div>
      
      {article.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-12 shadow-sm">
          <img src={article.imageUrl} alt={article.title} className="w-full h-auto" />
        </div>
      )}
      
      <div className="prose prose-lg prose-blue max-w-none text-gray-700">
        <div className="markdown-body">
          <Markdown>{article.content.replace(/\\n/g, '\n')}</Markdown>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-16 pt-10 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">कमेंट्स (Comments)</h3>
        
        <form 
          className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const text = (form.elements.namedItem('comment') as HTMLTextAreaElement).value;
            
            const newComment = { id: Date.now(), name, text, date: new Date().toLocaleDateString('hi-IN') };
            const existing = JSON.parse(localStorage.getItem(`comments_${slug}`) || '[]');
            localStorage.setItem(`comments_${slug}`, JSON.stringify([...existing, newComment]));
            
            form.reset();
            // Force re-render (a bit hacky but works for local storage without extra state)
            window.location.reload();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">आपका नाम</label>
            <input name="name" required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="अपना नाम लिखें..." />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">आपकी राय</label>
            <textarea name="comment" required rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="इस आर्टिकल के बारे में अपने विचार साझा करें..."></textarea>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            कमेंट पोस्ट करें
          </button>
        </form>

        <div className="space-y-6">
          {JSON.parse(localStorage.getItem(`comments_${slug}`) || '[]').length === 0 ? (
            <p className="text-gray-500">अभी तक कोई कमेंट नहीं है। सबसे पहले कमेंट करने वाले बनें!</p>
          ) : (
            JSON.parse(localStorage.getItem(`comments_${slug}`) || '[]').map((c: any) => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.date}</span>
                  </div>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;

    const headers = { "Authorization": `Bearer ${token}` };

    fetch("/api/settings", { headers }).then(r => {
      if (r.status === 401) handleLogout();
      return r.json();
    }).then(data => {
      setSettings(data.error ? null : data);
    }).catch(console.error);

    fetch("/api/logs", { headers }).then(r => {
      if (r.status === 401) handleLogout();
      return r.json();
    }).then(data => {
      setLogs(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    if (res.status === 401) {
      handleLogout();
    } else {
      alert("Settings saved!");
    }
  };

  if (!token) {
    return <AdminLogin onLogin={(t) => {
      localStorage.setItem("adminToken", t);
      setToken(t);
    }} />;
  }

  if (!settings) return <div className="p-10 text-center">Loading Admin...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
        <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">AI Agent Settings</h2>
          
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.agentStatus}
                onChange={e => setSettings({...settings, agentStatus: e.target.checked})}
              />
              <span className="font-medium text-gray-900">Enable Autonomous AI Agent</span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-8">If enabled, the agent will automatically research, write, and publish articles.</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Article Limit</label>
            <input type="number" min="1" max="10" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.dailyLimit}
              onChange={e => setSettings({...settings, dailyLimit: parseInt(e.target.value)})}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Write New Article (Manual)</h2>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const title = formData.get("title") as string;
            
            const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
            const slug = slugify(title) + '-' + Math.floor(Math.random()*1000);

            const payload = {
              title,
              slug,
              content: formData.get("content"),
              category: formData.get("category") || "General",
              imageUrl: formData.get("imageUrl")
            };

            const res = await fetch("/api/articles", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              alert("Article published successfully!");
              form.reset();
            } else {
              alert("Failed to publish article");
            }
          }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input name="title" required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input name="category" required type="text" defaultValue="General" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input name="imageUrl" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
              <textarea name="content" required rows={6} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
              Publish Article
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="text-xl font-bold mb-6">Agent Activity Logs</h2>
          <div className="overflow-y-auto max-h-[400px] pr-2">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="border-l-4 pl-4 py-1" style={{ borderColor: log.status === 'success' ? '#10B981' : log.status === 'error' ? '#EF4444' : '#3B82F6' }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{log.task}</span>
                      <span className="text-xs text-gray-500">{format(new Date(log.date), 'MMM d, HH:mm')}</span>
                    </div>
                    {log.topic && <p className="text-sm text-gray-600">Topic: {log.topic}</p>}
                    {log.error && <p className="text-sm text-red-600 mt-1">{log.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
