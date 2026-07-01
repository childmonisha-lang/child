/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Terminal as TerminalIcon, 
  BookOpen, 
  PenTool, 
  TrendingUp, 
  SlidersHorizontal, 
  Plus, 
  Edit3, 
  Check, 
  ArrowRight, 
  RotateCw, 
  ArrowUpRight, 
  Calendar, 
  User, 
  FileText, 
  X, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  Globe,
  Database,
  ArrowUpDown
} from "lucide-react";

import { Article, TerminalMessage, ProtocolMetric } from "./types";
import { getSavedArticles, saveArticle, INITIAL_PROTOCOLS, ARTICLE_IMAGES } from "./data";

export default function App() {
  // Navigation tabs: 'intelligence' (blog list/feed), 'terminal' (AI terminal node), 'publishing' (write/edit/AI generate), 'markets' (protocol tracker)
  const [activeTab, setActiveTab] = useState<"intelligence" | "terminal" | "publishing" | "markets">("intelligence");
  
  // Blog / Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "readingTime">("newest");
  
  // Selected single article for detailed view
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Form state for creating / editing articles
  const [isEditing, setIsEditing] = useState(false);
  const [editArticleId, setEditArticleId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formCategory, setFormCategory] = useState<"AI & TECH" | "WEB3 PULSE" | "MONEY MAKING">("AI & TECH");
  const [formReadingTime, setFormReadingTime] = useState("5 min read");
  const [formAuthor, setFormAuthor] = useState("Lead Research Node");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  
  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generatorError, setGeneratorError] = useState("");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Terminal state
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalLoading, setIsTerminalLoading] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Markets / Protocols state
  const [protocols, setProtocols] = useState<ProtocolMetric[]>(INITIAL_PROTOCOLS);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolMetric | null>(INITIAL_PROTOCOLS[0]);
  const [protocolAnalysis, setProtocolAnalysis] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Live market ticker prices
  const [btcPrice, setBtcPrice] = useState(64321.05);
  const [ethPrice, setEthPrice] = useState(3412.12);
  const [solPrice, setSolPrice] = useState(145.22);
  const [gptPrice, setGptPrice] = useState(2.04);

  // Load articles on mount
  useEffect(() => {
    setArticles(getSavedArticles());
    
    // Seed initial system messages for terminal
    setTerminalMessages([
      {
        id: "sys-1",
        role: "system",
        content: "FUTURELEDGER Sovereign Terminal Node [v4.12] initialized.",
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: "sys-2",
        role: "system",
        content: "Secure websocket link established with @google/genai gateway.",
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: "sys-3",
        role: "model",
        content: "Greetings intelligence operator. I am the on-chain neural consensus node. Enter any command or ask for structural analysis of liquidity pools, L2 restaking risk vectors, or macroeconomic events.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    // Live update simulated prices
    const timer = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.48) * 15);
      setEthPrice(prev => prev + (Math.random() - 0.5) * 2);
      setSolPrice(prev => prev + (Math.random() - 0.49) * 0.3);
      setGptPrice(prev => Math.max(0.1, prev + (Math.random() - 0.45) * 0.01));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalMessages]);

  // Handle newsletter signup
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail("");
    }, 3000);
  };

  // Run terminal command / AI conversation
  const sendTerminalCommand = async (customCommand?: string) => {
    const cmd = customCommand || terminalInput;
    if (!cmd.trim()) return;

    const userMessage: TerminalMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cmd,
      timestamp: new Date().toLocaleTimeString(),
      isCommand: true,
      commandName: cmd.startsWith("/") ? cmd.split(" ")[0] : undefined
    };

    setTerminalMessages(prev => [...prev, userMessage]);
    if (!customCommand) setTerminalInput("");
    setIsTerminalLoading(true);

    try {
      // Map message history to lightweight server format
      const history = terminalMessages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/gemini/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cmd, history })
      });

      const data = await res.json();
      
      if (res.ok) {
        setTerminalMessages(prev => [...prev, {
          id: `model-${Date.now()}`,
          role: "model",
          content: data.response,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error(data.error || "Terminal execution failed.");
      }
    } catch (error: any) {
      setTerminalMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "system",
        content: `Error: ${error.message || "Failed to communicate with consensus engine."}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTerminalLoading(false);
    }
  };

  // Use Gemini to write a high-fidelity blog post
  const generateArticleWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingArticle(true);
    setGeneratorError("");

    try {
      const res = await fetch("/api/gemini/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, category: formCategory })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const generated = data.article;
        
        // Select an appropriate image according to category
        let image = ARTICLE_IMAGES.placeholder1;
        if (generated.category === "AI & TECH") image = ARTICLE_IMAGES.aiTech;
        else if (generated.category === "WEB3 PULSE") image = ARTICLE_IMAGES.web3Pulse;
        else if (generated.category === "MONEY MAKING") image = ARTICLE_IMAGES.moneyMaking;

        // Auto-populate the form with beautifully drafted content
        setFormTitle(generated.title);
        setFormSubtitle(generated.subtitle);
        setFormCategory(generated.category);
        setFormReadingTime(generated.readingTime);
        setFormAuthor(generated.author);
        setFormContent(generated.content);
        setFormImageUrl(image);
        
        // Clear prompt
        setAiPrompt("");
      } else {
        throw new Error(data.error || "AI Generation error.");
      }
    } catch (error: any) {
      setGeneratorError(error.message || "Could not synthesize AI publication.");
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // Submit manual or AI generated article
  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const newArticle: Article = {
      id: editArticleId || slug || `article-${Date.now()}`,
      title: formTitle,
      subtitle: formSubtitle,
      category: formCategory,
      readingTime: formReadingTime,
      author: formAuthor,
      authorTitle: "Contributing Analyst",
      date: isEditing && editArticleId 
        ? (articles.find(a => a.id === editArticleId)?.date || new Date().toLocaleDateString())
        : new Date().toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      imageUrl: formImageUrl || ARTICLE_IMAGES.placeholder1,
      imageAlt: formTitle,
      content: formContent
    };

    const updated = saveArticle(newArticle);
    setArticles(updated);
    
    // Reset states
    setFormTitle("");
    setFormSubtitle("");
    setFormContent("");
    setFormImageUrl("");
    setIsEditing(false);
    setEditArticleId(null);
    
    // Jump to view the published post
    setSelectedArticle(newArticle);
    setActiveTab("intelligence");
  };

  // Set up edit mode for a blog post
  const startEditing = (article: Article) => {
    setEditArticleId(article.id);
    setIsEditing(true);
    setFormTitle(article.title);
    setFormSubtitle(article.subtitle);
    setFormCategory(article.category);
    setFormReadingTime(article.readingTime);
    setFormAuthor(article.author);
    setFormContent(article.content);
    setFormImageUrl(article.imageUrl);
    
    // Switch to editing view
    setActiveTab("publishing");
  };

  // Delete article from local storage
  const deleteArticle = (id: string) => {
    if (confirm("Are you sure you want to retract this publication from the network?")) {
      const filtered = articles.filter(a => a.id !== id);
      localStorage.setItem("futureledger_articles", JSON.stringify(filtered));
      setArticles(filtered);
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
    }
  };

  // Generate automated AI Risk Analysis for protocols
  const fetchProtocolRiskAnalysis = async (protocol: ProtocolMetric) => {
    setSelectedProtocol(protocol);
    setIsLoadingAnalysis(true);
    setProtocolAnalysis("");

    try {
      const prompt = `Perform a high-density, quantitative risk and security analysis for the protocol: "${protocol.name}". ` +
        `Category: ${protocol.category}, current TVL: $${protocol.tvl}M, APY: ${protocol.apy}%, active validator nodes: ${protocol.activeNodes}. ` +
        `State current risk rating, potential smart-contract or leverage vulnerability vectors, and a strategic hedge recommendation. Keep it strictly professional.`;

      const res = await fetch("/api/gemini/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      const data = await res.json();
      if (res.ok) {
        setProtocolAnalysis(data.response);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setProtocolAnalysis(`Failed to load automated node consensus: ${e.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Fetch AI Briefing / Summary for the active modal article
  const [articleSummary, setArticleSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchArticleSummary = async (article: Article) => {
    setIsLoadingSummary(true);
    setArticleSummary("");
    try {
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          subtitle: article.subtitle,
          content: article.content
        })
      });
      const data = await res.json();
      if (res.ok) {
        setArticleSummary(data.summary);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setArticleSummary(`Consensus failure compiling briefing: ${e.message}`);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Filter and sort logic for articles
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "ALL" || article.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        // Sort by reading time parsed as integer
        const timeA = parseInt(a.readingTime) || 0;
        const timeB = parseInt(b.readingTime) || 0;
        return timeB - timeA;
      }
    });

  // Split featured story (usually first or custom flag)
  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const regularArticles = filteredArticles.filter(a => a.id !== (selectedArticle ? "" : featuredArticle?.id));

  // Render inline custom markdown blocks with exquisite typography
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="font-display text-3xl md:text-4xl text-slate-900 font-extrabold tracking-tight mt-8 mb-4">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="font-display text-2xl text-slate-800 font-bold mt-6 mb-3 border-b border-slate-100 pb-1">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="font-display text-xl text-slate-800 font-bold mt-4 mb-2">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("> ")) {
        return <blockquote key={idx} className="border-l-4 border-blue-600 pl-4 py-2 my-4 bg-slate-50 italic text-slate-700 font-sans">{line.replace("> ", "")}</blockquote>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="ml-6 list-disc text-slate-700 my-1 font-sans">{line.replace("- ", "")}</li>;
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      
      // Inline formatting helper for bold / code
      let formattedLine: React.ReactNode = line;
      if (line.includes("**")) {
        const parts = line.split("**");
        formattedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-slate-900">{part}</strong> : part);
      }

      return <p key={idx} className="text-slate-700 leading-relaxed my-3 font-sans font-light text-base md:text-lg">{formattedLine}</p>;
    });
  };

  return (
    <div className="bg-[#f8f9ff] text-[#171c23] font-sans antialiased min-h-screen selection:bg-blue-600 selection:text-white">
      {/* 1. High Tech Market Ticker */}
      <div id="market-ticker" className="fixed top-0 w-full z-[60] h-[30px] bg-[#0A1628] text-white flex items-center overflow-hidden border-b border-blue-600/30">
        <div className="flex whitespace-nowrap ticker-scroll items-center gap-10">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">BTC/USD</span>
            <span>${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-emerald-400 font-bold blink">+2.4%</span>
          </div>
          <span className="text-blue-500 opacity-50">//</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">ETH/USD</span>
            <span>${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-rose-400 font-bold">-0.8%</span>
          </div>
          <span className="text-blue-500 opacity-50">//</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">SOL/USD</span>
            <span>${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-emerald-400 font-bold">+5.1%</span>
          </div>
          <span className="text-blue-500 opacity-50">//</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">GPT-5 TOKEN</span>
            <span>${gptPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            <span className="text-emerald-400 font-bold">+12.4%</span>
          </div>
          {/* Replicating items for scrolling illusion */}
          <span className="text-blue-500 opacity-50">//</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">BTC/USD</span>
            <span>${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-emerald-400 font-bold">+2.4%</span>
          </div>
          <span className="text-blue-500 opacity-50">//</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#ba0035] font-bold">ETH/USD</span>
            <span>${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[#ba0035]">-0.8%</span>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header id="app-header" className="fixed top-[30px] w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex justify-between items-center h-[72px] px-6 lg:px-12 w-full mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSelectedArticle(null); setActiveTab("intelligence"); }} 
              className="font-display text-2xl font-extrabold tracking-tighter text-[#0A1628] hover:opacity-80 transition-all flex items-center gap-2"
            >
              <span>FUTURELEDGER</span>
              <span className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 tracking-widest rounded-sm">V4</span>
            </button>
          </div>

          <nav id="main-nav" className="hidden md:flex items-center gap-8 font-mono text-[12px] uppercase tracking-widest text-slate-500">
            <button 
              onClick={() => { setSelectedArticle(null); setActiveTab("intelligence"); }}
              className={`py-1 transition-all border-b-2 hover:text-blue-600 ${activeTab === "intelligence" ? "text-blue-600 border-blue-600 font-medium" : "border-transparent"}`}
            >
              Intelligence
            </button>
            <button 
              onClick={() => setActiveTab("terminal")}
              className={`py-1 transition-all border-b-2 hover:text-blue-600 flex items-center gap-1.5 ${activeTab === "terminal" ? "text-blue-600 border-blue-600 font-medium" : "border-transparent"}`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600 blink" /> Consensual Node
            </button>
            <button 
              onClick={() => setActiveTab("publishing")}
              className={`py-1 transition-all border-b-2 hover:text-blue-600 flex items-center gap-1 ${activeTab === "publishing" ? "text-blue-600 border-blue-600 font-medium" : "border-transparent"}`}
            >
              <PenTool className="w-3.5 h-3.5" /> Publishing Hub
            </button>
            <button 
              onClick={() => setActiveTab("markets")}
              className={`py-1 transition-all border-b-2 hover:text-blue-600 flex items-center gap-1 ${activeTab === "markets" ? "text-blue-600 border-blue-600 font-medium" : "border-transparent"}`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Live Protocols
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditArticleId(null);
                setFormTitle("");
                setFormSubtitle("");
                setFormContent("");
                setFormImageUrl("");
                setActiveTab("publishing");
              }}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-sm font-mono text-[12px] uppercase tracking-widest shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-[102px]">
        {/* VIEW 1: INTELLIGENCE (Main Feed & Custom Blog Controls) */}
        {activeTab === "intelligence" && !selectedArticle && (
          <div id="view-intelligence">
            {/* Massive Tech Hero Banner */}
            <section className="relative bg-[#0A1628] overflow-hidden min-h-[640px] flex items-center pt-12 pb-24">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628] via-[#0A1628]/95 to-transparent"></div>
              
              {/* Animated high-tech grid deco */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#2563eb 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
              
              <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="h-[12px] w-[12px] bg-rose-500 rounded-full blink"></span>
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-[0.25em]">Autonomous Intelligence System Active</span>
                  </div>
                  
                  <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-extrabold uppercase leading-[0.9] tracking-tighter">
                    TRACK <br className="hidden md:inline" /> TOMORROW'S <br /> <span className="text-blue-500">WEALTH.</span>
                  </h1>
                  
                  <p className="text-slate-400 font-sans text-lg md:text-xl max-w-2xl mt-8 leading-relaxed font-light">
                    Sovereign algorithms, neural VC markets, and real-time protocol vectors. Architecting physical clarity inside decentralized financial frameworks.
                  </p>
                </div>

                {featuredArticle && (
                  <div className="lg:col-span-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-lg shadow-2xl hover:border-blue-500/30 transition-all">
                      <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 block">🔥 Featured Dispatch</span>
                      <h2 className="font-display text-2xl text-white font-bold leading-tight mb-4">{featuredArticle.title}</h2>
                      <p className="text-slate-300 font-sans text-sm font-light leading-relaxed mb-6 line-clamp-3">
                        {featuredArticle.subtitle}
                      </p>
                      
                      <button 
                        onClick={() => {
                          setSelectedArticle(featuredArticle);
                          fetchArticleSummary(featuredArticle);
                        }} 
                        className="group flex items-center gap-3 text-white font-mono text-[11px] uppercase tracking-widest hover:text-blue-400 transition-all"
                      >
                        Initialize Analysis 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 font-display text-[180px] text-white/[0.02] pointer-events-none select-none translate-y-16 translate-x-12 leading-none font-black">
                INTELLIGENCE
              </div>
            </section>

            {/* Quick Statistics Strip */}
            <section className="bg-white border-y border-slate-200/80 shadow-sm relative z-10">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-4xl text-[#0A1628] font-black tracking-tight">128K</span>
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-2">Active Readers</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-4xl text-blue-600 font-black tracking-tight">{articles.length}+</span>
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-2">Ledger Dispatches</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-4xl text-[#0A1628] font-black tracking-tight">$8.2B</span>
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-2">Tracked Liquidity</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-4xl text-rose-500 font-black tracking-tight">24/7</span>
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-2">Neural Streaming</span>
                </div>
              </div>
            </section>

            {/* Dynamic Search & Sort Navigation */}
            <section className="py-12 bg-slate-50 border-b border-slate-200/50">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                  
                  {/* Category Pill Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {["ALL", "AI & TECH", "WEB3 PULSE", "MONEY MAKING"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-wider transition-all border ${
                          categoryFilter === cat 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-slate-600 hover:text-blue-600 border-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sort controls */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                    <div className="relative w-full sm:w-72 bg-white rounded-sm border border-slate-200 focus-within:border-blue-600 transition-all shadow-sm">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search the ledger archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-400 font-sans font-light"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-3 py-2.5 shadow-sm text-xs text-slate-600">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent border-none outline-none font-mono text-[11px] uppercase tracking-wider text-slate-700 cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="readingTime">Longest Read</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Articles Grid (Searchable & Sortable) */}
            <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="font-display text-4xl text-[#0A1628] font-extrabold tracking-tight uppercase">Latest from the Ledger</h2>
                  <p className="font-mono text-xs text-slate-400 uppercase tracking-wider mt-2">Synchronized real-time reporting</p>
                </div>
                {searchQuery && (
                  <span className="bg-blue-50 text-blue-700 font-mono text-[11px] px-3 py-1 border border-blue-200 rounded-sm">
                    Found {filteredArticles.length} publications
                  </span>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-200 rounded-sm p-12">
                  <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No sovereign logs match your query</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Try resetting your filter parameters or search terms to fetch historical archives.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setCategoryFilter("ALL"); }}
                    className="mt-6 bg-blue-600 text-white px-5 py-2 font-mono text-[11px] uppercase tracking-widest rounded-sm"
                  >
                    Reset Query Parameters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <article 
                      key={article.id} 
                      className="group bg-white border border-slate-200/80 rounded-sm p-8 hover:bg-[#F0F4FF]/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Article Image (Hotlinked elegantly) */}
                        <div className="mb-6 overflow-hidden aspect-[16/10] bg-slate-900 rounded-sm relative">
                          <img 
                            src={article.imageUrl} 
                            alt={article.imageAlt}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                            article.category === "AI & TECH" ? "text-rose-600" :
                            article.category === "WEB3 PULSE" ? "text-blue-600" : "text-emerald-600"
                          }`}>
                            {article.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 uppercase">{article.date}</span>
                        </div>

                        <h3 className="font-display text-xl text-[#0A1628] font-extrabold leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-slate-500 font-sans text-sm font-light leading-relaxed line-clamp-3 mb-6">
                          {article.subtitle}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                              {article.author.slice(0, 2)}
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">{article.author}</span>
                              <span className="block text-[10px] text-slate-400 uppercase">{article.readingTime}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => startEditing(article)}
                              title="Edit Publication"
                              className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-sm text-slate-400 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteArticle(article.id)}
                              title="Retract Publication"
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-sm text-slate-400 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedArticle(article);
                                fetchArticleSummary(article);
                              }}
                              className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-sm text-blue-500 transition-all ml-1"
                              title="Read Analysis"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Newsletter Subscription Card */}
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="relative bg-blue-600 p-12 lg:p-20 overflow-hidden rounded-lg shadow-xl">
                  {/* Digital dot matrix background deco */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="font-display text-3xl md:text-5xl text-white font-extrabold uppercase tracking-tight">
                        THE FUTURE ISN'T WRITTEN YET. <span className="text-[#0A1628]">READ IT HERE FIRST.</span>
                      </h2>
                      <p className="text-blue-100 text-base md:text-lg max-w-md mt-4 font-light">
                        Join over 128,000 institutional readers receiving weekly briefings on the codebases of tomorrow's financial architecture.
                      </p>
                    </div>

                    <div>
                      {newsletterSubscribed ? (
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded border border-white/20 text-white text-center">
                          <Check className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                          <h4 className="font-mono text-sm uppercase tracking-widest font-bold">Consensus Verified</h4>
                          <p className="text-xs text-blue-100 mt-2">Your subscription address is mapped to the mailing node.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleNewsletterSubmit} className="bg-white p-2 flex flex-col md:flex-row gap-2 rounded-sm shadow-inner">
                          <input
                            type="email"
                            required
                            placeholder="YOUR SYSTEM EMAIL"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            className="flex-grow bg-transparent border-none text-slate-800 font-mono text-[12px] px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                          />
                          <button 
                            type="submit" 
                            className="bg-[#0A1628] text-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all text-center shrink-0"
                          >
                            Authenticate
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SINGLE DETAILED ARTICLE SCREEN */}
        {selectedArticle && (
          <div id="view-article-detail" className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            {/* Back button */}
            <button 
              onClick={() => { setSelectedArticle(null); setArticleSummary(""); }}
              className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-mono text-[11px] uppercase tracking-wider mb-8"
            >
              <X className="w-4 h-4" /> Close Intelligence Log
            </button>

            <article className="bg-white border border-slate-200 p-8 md:p-12 rounded-sm shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-xs">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-sm font-semibold uppercase">{selectedArticle.category}</span>
                <span className="text-slate-400">//</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedArticle.date}
                </span>
                <span className="text-slate-400">//</span>
                <span className="text-slate-500 font-medium uppercase tracking-wide">
                  {selectedArticle.readingTime}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-5xl text-[#0A1628] font-black tracking-tight leading-tight mb-4">
                {selectedArticle.title}
              </h1>

              <p className="text-slate-500 text-lg md:text-xl font-sans font-light leading-relaxed mb-8 border-l-2 border-blue-500 pl-4 italic">
                {selectedArticle.subtitle}
              </p>

              {/* Cover Image */}
              <div className="mb-10 rounded-sm overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-100">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.imageAlt} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Executive Summary Widget (Synthesized server-side by Gemini) */}
              <div className="bg-slate-50 border border-blue-100 p-6 md:p-8 rounded-sm mb-10">
                <div className="flex items-center gap-2 text-blue-700 font-mono text-xs uppercase tracking-wider mb-4 font-bold">
                  <Sparkles className="w-4 h-4 blink text-blue-600" /> Neural Briefing Synthesizer
                </div>
                
                {isLoadingSummary ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-mono py-4">
                    <RotateCw className="w-4 h-4 animate-spin text-blue-600" /> Computing on-chain model weights...
                  </div>
                ) : (
                  <div className="text-sm font-sans font-light text-slate-700 leading-relaxed">
                    {articleSummary ? (
                      <div className="prose prose-sm prose-slate">
                        <div className="whitespace-pre-wrap">{articleSummary}</div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span>Compile an autonomous AI executive summary.</span>
                        <button 
                          onClick={() => fetchArticleSummary(selectedArticle)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-sm shadow-sm flex items-center gap-1"
                        >
                          Synthesize
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Render content */}
              <div className="prose prose-lg max-w-none prose-slate mt-8 border-t border-slate-100 pt-8">
                {renderMarkdown(selectedArticle.content)}
              </div>

              {/* Author Footer info */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono text-lg font-bold">
                    {selectedArticle.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800 uppercase tracking-wide">{selectedArticle.author}</span>
                    <span className="block text-xs text-slate-500">{selectedArticle.authorTitle || "Resident Researcher"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEditing(selectedArticle)}
                    className="border border-slate-200 hover:border-blue-600 hover:text-blue-600 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded-sm text-slate-600 flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Log
                  </button>
                  <button 
                    onClick={() => {
                      const backList = articles.filter(a => a.id !== selectedArticle.id);
                      setSelectedArticle(null);
                      setArticles(backList);
                      localStorage.setItem("futureledger_articles", JSON.stringify(backList));
                    }}
                    className="border border-transparent hover:bg-rose-50 text-rose-600 px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Retract
                  </button>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* VIEW 3: INTERACTIVE CONSOL ENGINE (AI Terminal Node) */}
        {activeTab === "terminal" && (
          <div id="view-terminal" className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <div className="bg-[#0A1628] rounded-lg border border-blue-600/30 overflow-hidden shadow-2xl flex flex-col h-[750px]">
              
              {/* Terminal top status bar */}
              <div className="bg-[#0c1a30] px-6 py-4 border-b border-blue-600/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full bg-blue-500 blink"></span>
                  <div className="font-mono text-xs text-slate-300 flex items-center gap-2">
                    <span className="font-bold text-blue-400">CONVENER-NODE_0x1F</span>
                    <span className="opacity-40">|</span>
                    <span className="text-emerald-400 uppercase tracking-widest font-bold">Secured Endpoint</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                  <span>MODEL: <strong className="text-slate-200">GEMINI-3.5-FLASH</strong></span>
                  <span className="opacity-30">|</span>
                  <span>PING: <strong className="text-blue-400">12ms</strong></span>
                </div>
              </div>

              {/* Terminal instructions panel */}
              <div className="bg-blue-950/20 px-6 py-3 border-b border-blue-600/10 flex flex-wrap gap-2 items-center flex-shrink-0 text-slate-300 text-xs">
                <span className="font-mono font-bold text-[10px] text-blue-400 uppercase tracking-widest">Preloaded Prompts:</span>
                <button 
                  onClick={() => sendTerminalCommand("Analyze dynamic risks of Liquid Restaking Tokens (LRTs) in 2026.")}
                  className="bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/20 px-3 py-1 rounded-sm text-[10px] font-mono text-slate-300 tracking-wider transition-all"
                >
                  Restaking Risks
                </button>
                <button 
                  onClick={() => sendTerminalCommand("Explain how Zero-Knowledge proofs protect computational model weights.")}
                  className="bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/20 px-3 py-1 rounded-sm text-[10px] font-mono text-slate-300 tracking-wider transition-all"
                >
                  ZK-Proof Weights
                </button>
                <button 
                  onClick={() => sendTerminalCommand("Calculate risk-adjusted APY projections for L2 networks facing consensus bottlenecks.")}
                  className="bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/20 px-3 py-1 rounded-sm text-[10px] font-mono text-slate-300 tracking-wider transition-all"
                >
                  Consensus APY
                </button>
                <button 
                  onClick={() => {
                    setTerminalMessages([
                      {
                        id: `sys-reset-${Date.now()}`,
                        role: "system",
                        content: "Console system variables cleared. Rebooting local state machine...",
                        timestamp: new Date().toLocaleTimeString()
                      }
                    ]);
                  }}
                  className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 px-3 py-1 rounded-sm text-[10px] font-mono text-rose-300 tracking-wider ml-auto transition-all"
                >
                  Clear Log
                </button>
              </div>

              {/* Terminal Logs Display */}
              <div className="flex-grow p-6 overflow-y-auto font-mono text-[13px] text-slate-200 space-y-6 bg-[#07111E]">
                {terminalMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1.5 uppercase">
                      <span>{msg.role === "user" ? "OPERATOR" : msg.role === "model" ? "CONSENSUS ENGINE" : "CORE SYSTEM"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className={`p-4 rounded-sm max-w-3xl whitespace-pre-wrap leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white font-medium" 
                        : msg.role === "model" 
                        ? "bg-[#0c1a30] border border-blue-900 text-slate-100" 
                        : "bg-slate-900/60 border border-slate-800 text-slate-400 text-xs italic"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTerminalLoading && (
                  <div className="flex items-center gap-3 text-blue-400 py-2">
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-blue-400 rounded-full animate-spin"></span>
                    <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Retrieving decentralized intelligence matrix...</span>
                  </div>
                )}
                <div ref={terminalBottomRef} />
              </div>

              {/* Terminal input console */}
              <div className="p-4 bg-[#0c1a30] border-t border-blue-600/20 flex-shrink-0">
                <div className="flex items-center bg-[#07111E] rounded-sm border border-blue-900/60 focus-within:border-blue-500 transition-all">
                  <span className="pl-4 text-blue-500 font-mono font-bold select-none text-sm">{`>`}</span>
                  <input
                    type="text"
                    disabled={isTerminalLoading}
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendTerminalCommand();
                    }}
                    placeholder="Enter command or natural language research query..."
                    className="w-full bg-transparent text-white font-mono text-[13px] py-4 px-3 focus:outline-none focus:ring-0 disabled:opacity-50"
                  />
                  <button
                    disabled={isTerminalLoading || !terminalInput.trim()}
                    onClick={() => sendTerminalCommand()}
                    className="mr-2 px-5 py-2.5 bg-blue-600 text-white rounded-sm font-mono text-[11px] uppercase tracking-wider hover:bg-blue-700 disabled:opacity-40 transition-all shrink-0"
                  >
                    Execute
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: PUBLISHING HUB (Create / Edit / AI Draft Module) */}
        {activeTab === "publishing" && (
          <div id="view-publishing" className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Traditional Authoring Controls */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <h2 className="font-display text-2xl text-[#0A1628] font-extrabold uppercase">
                      {isEditing ? "Modify Published Ledger" : "Initiate Intelligence Ledger"}
                    </h2>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">SECURE NODE</span>
                  </div>

                  <form onSubmit={handleArticleSubmit} className="space-y-6">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Ledger Title *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g., The Sovereign Node: Re-architecting Yield Pools"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Ledger Thesis / Subtitle</label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="e.g., A granular analysis of state machine transitions..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Classification</label>
                        <select
                          value={formCategory}
                          onChange={(e: any) => setFormCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="AI & TECH">AI & TECH</option>
                          <option value="WEB3 PULSE">WEB3 PULSE</option>
                          <option value="MONEY MAKING">MONEY MAKING</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Reading Duration</label>
                        <input
                          type="text"
                          required
                          value={formReadingTime}
                          onChange={(e) => setFormReadingTime(e.target.value)}
                          placeholder="e.g., 5 min read"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Research Analyst</label>
                        <input
                          type="text"
                          required
                          value={formAuthor}
                          onChange={(e) => setFormAuthor(e.target.value)}
                          placeholder="Author Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Cover Image URL (Recommended)</label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="Image URL or leave blank for elegant defaults"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Ledger Publication Content (Markdown Supported) *</label>
                      <textarea
                        required
                        rows={12}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="# Heading 1&#10;Add structured, authoritative text here using Markdown style..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 font-mono transition-all resize-y"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-mono text-[12px] uppercase tracking-widest py-4 rounded-sm shadow-md transition-all font-medium"
                      >
                        {isEditing ? "Update Core Ledgers" : "Broadcast to Core Network"}
                      </button>
                      
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditArticleId(null);
                            setFormTitle("");
                            setFormSubtitle("");
                            setFormContent("");
                            setFormImageUrl("");
                          }}
                          className="border border-slate-200 hover:bg-slate-50 px-6 py-4 font-mono text-[12px] uppercase tracking-widest rounded-sm text-slate-600 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: AI Writer Agent (Generate entire blog post instantly!) */}
              <div className="lg:col-span-5 space-y-8">
                
                <div className="bg-[#0A1628] text-white p-8 rounded-sm shadow-xl border border-blue-600/30">
                  <div className="flex items-center gap-2 mb-6 text-blue-400">
                    <Sparkles className="w-5 h-5 blink text-blue-500" />
                    <h3 className="font-display text-lg font-bold uppercase tracking-wider">Gemini AI Author Node</h3>
                  </div>

                  <p className="text-slate-300 font-sans text-sm font-light leading-relaxed mb-6">
                    Bypass traditional research cycles. Input an intelligence topic or research prompt, and let the Gemini on-chain generator construct a fully formatted, beautifully articulated technical ledger post complete with structured subheadings, titles, and metrics.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">Drafting Focus Prompt</label>
                      <textarea
                        rows={4}
                        disabled={isGeneratingArticle}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., An expert analysis on security exploits of modular consensus bridges and mitigation algorithms..."
                        className="w-full px-4 py-3 bg-[#0c1a30] border border-blue-900 text-slate-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 font-mono transition-all placeholder:text-slate-500"
                      ></textarea>
                    </div>

                    {generatorError && (
                      <div className="p-4 bg-rose-950/40 border border-rose-500/20 rounded text-rose-300 text-xs font-mono">
                        System Interruption: {generatorError}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isGeneratingArticle || !aiPrompt.trim()}
                      onClick={generateArticleWithAI}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/40 text-white font-mono text-[11px] uppercase tracking-widest py-3.5 rounded-sm flex items-center justify-center gap-2 transition-all font-medium"
                    >
                      {isGeneratingArticle ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Synthesizing Research Block...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-blue-300" />
                          Draft Full Intelligence Article
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Technical tips display */}
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-slate-800 font-bold mb-4">Analyst Protocols</h4>
                  <ul className="space-y-3 text-xs text-slate-500 font-sans font-light leading-relaxed list-disc pl-4">
                    <li>Publications broadcasted from this node are persisted dynamically inside browser memory and server cache indices.</li>
                    <li>Always provide factual structural details or use the Gemini AI drafting node to maintain institutional-grade quality standards.</li>
                    <li>Both markdown tags and high-resolution link hot-linking can be parsed by the client router safely.</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 5: MARKETS & PROTOCOLS TRACKER */}
        {activeTab === "markets" && (
          <div id="view-markets" className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Side: Real-time dynamic protocol list */}
              <div className="lg:col-span-6">
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
                  <div className="mb-6">
                    <h2 className="font-display text-2xl text-[#0A1628] font-extrabold uppercase">Live Node Validators</h2>
                    <p className="font-mono text-[10px] text-slate-400 uppercase mt-2">Continuous network polling indicators</p>
                  </div>

                  <div className="space-y-4">
                    {protocols.map((protocol) => (
                      <button
                        key={protocol.id}
                        onClick={() => fetchProtocolRiskAnalysis(protocol)}
                        className={`w-full text-left p-6 border rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                          selectedProtocol?.id === protocol.id 
                            ? "bg-[#F0F4FF] border-blue-500/60 shadow-inner" 
                            : "bg-slate-50 hover:bg-slate-100/70 border-slate-200/80"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 uppercase tracking-wide text-sm">{protocol.name}</span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-sm">{protocol.category}</span>
                          </div>
                          
                          <div className="flex gap-4 mt-2 font-mono text-xs text-slate-500">
                            <span>TVL: <strong className="text-slate-700">${(protocol.tvl / 1000).toFixed(2)}B</strong></span>
                            <span>•</span>
                            <span>APY: <strong className="text-emerald-600">{protocol.apy}%</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-[10px] px-2.5 py-1 rounded-sm text-white font-bold ${
                            protocol.status === "OPTIMAL" ? "bg-emerald-600" :
                            protocol.status === "NOMINAL" ? "bg-blue-600" : "bg-amber-600"
                          }`}>
                            {protocol.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Gemini Autonomous AI Risk analysis report */}
              <div className="lg:col-span-6">
                <div className="bg-[#0A1628] text-white p-8 rounded-sm shadow-xl border border-blue-600/30 min-h-[500px]">
                  
                  {selectedProtocol ? (
                    <div>
                      <div className="flex items-center justify-between border-b border-blue-900 pb-4 mb-6">
                        <div>
                          <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest block">AI CONSENSUS VECTORS</span>
                          <h3 className="font-display text-xl font-bold uppercase mt-1 text-slate-100">{selectedProtocol.name} Analysis</h3>
                        </div>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 blink"></span>
                      </div>

                      {isLoadingAnalysis ? (
                        <div className="space-y-4 py-12 text-center text-slate-400 font-mono text-xs">
                          <RotateCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                          <span className="animate-pulse block uppercase tracking-wider">Compiling mathematical protocol weights...</span>
                        </div>
                      ) : (
                        <div>
                          {protocolAnalysis ? (
                            <div className="prose prose-invert prose-sm max-w-none font-mono text-xs text-slate-300 leading-relaxed space-y-4">
                              <div className="whitespace-pre-wrap">{protocolAnalysis}</div>
                            </div>
                          ) : (
                            <div className="text-center py-20 text-slate-400 font-mono text-xs">
                              <ShieldAlert className="w-12 h-12 text-blue-500/30 mx-auto mb-4" />
                              <p className="mb-6">Operational parameters loaded. Click synthesize to request a real-time smart-contract risk evaluation from Gemini.</p>
                              <button
                                onClick={() => fetchProtocolRiskAnalysis(selectedProtocol)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-sm text-[11px] uppercase tracking-widest font-bold font-mono shadow-md transition-all"
                              >
                                Synthesize Risk Report
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-24 text-slate-400 font-mono text-sm">
                      <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      Select a dynamic protocol validation node to compile analysis weights.
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer id="app-footer" className="w-full bg-[#0A1628] border-t-4 border-blue-600 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-6 lg:px-12 py-16 gap-12 w-full max-w-7xl mx-auto">
          
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl text-white font-extrabold uppercase tracking-tight mb-6">FUTURELEDGER</h2>
            <p className="font-sans text-xs text-slate-400 leading-relaxed mb-8 font-light">
              Architectural clarity at the intersection of finance, artificial intelligence, and decentralized sovereign protocols. Institutional-grade reporting.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab("terminal")}
                className="w-10 h-10 border border-slate-700 rounded-sm flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <TerminalIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTab("publishing")}
                className="w-10 h-10 border border-slate-700 rounded-sm flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTab("markets")}
                className="w-10 h-10 border border-slate-700 rounded-sm flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:border-blue-600 transition-all"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-xs text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 font-bold">Consensus Map</h5>
            <ul className="space-y-3 font-mono text-[11px] text-slate-400">
              <li><button onClick={() => { setSelectedArticle(null); setActiveTab("intelligence"); }} className="hover:text-blue-500 text-left">Intelligence Log</button></li>
              <li><button onClick={() => setActiveTab("terminal")} className="hover:text-blue-500 text-left">Sovereign Terminal</button></li>
              <li><button onClick={() => setActiveTab("publishing")} className="hover:text-blue-500 text-left">Publishing Matrix</button></li>
              <li><button onClick={() => setActiveTab("markets")} className="hover:text-blue-500 text-left">Nodes & Pools</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-xs text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 font-bold">Network Resources</h5>
            <ul className="space-y-3 font-mono text-[11px] text-slate-400">
              <li><a href="#market-ticker" className="hover:text-blue-500">Privacy Protocol</a></li>
              <li><a href="#market-ticker" className="hover:text-blue-500">Terms of Service</a></li>
              <li><a href="#market-ticker" className="hover:text-blue-500">API Documentation</a></li>
              <li><a href="#market-ticker" className="hover:text-blue-500">Contact Node</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-xs text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 font-bold">Node Diagnostics</h5>
            <div className="bg-[#0c1a30] p-6 border border-slate-800 rounded-sm">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Mainnet Nodes</span>
                <span className="text-emerald-400 font-bold">SYNCED</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Neural Processing</span>
                <span className="text-emerald-400 font-bold">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Data Latency</span>
                <span className="text-blue-400 font-bold">12ms</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 py-8 text-center text-slate-500 font-mono text-[9px] tracking-[0.25em] uppercase px-6">
          © 2026 FUTURELEDGER. ALL RIGHTS RESERVED. ARCHITECTURAL CLARITY IN FINANCE.
        </div>
      </footer>

      {/* Floating Side Social / Control Rails (Desktop Only) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 p-5 border-r border-slate-200/50 z-40 bg-white/40 backdrop-blur-md rounded-r-lg">
        <button 
          onClick={() => setActiveTab("terminal")} 
          title="Consensus Terminal" 
          className={`p-1.5 transition-all rounded-sm ${activeTab === "terminal" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600"}`}
        >
          <TerminalIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { setSelectedArticle(null); setActiveTab("intelligence"); }} 
          title="Intelligence archives" 
          className={`p-1.5 transition-all rounded-sm ${activeTab === "intelligence" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600"}`}
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setActiveTab("publishing")} 
          title="Publishing hub" 
          className={`p-1.5 transition-all rounded-sm ${activeTab === "publishing" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600"}`}
        >
          <PenTool className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setActiveTab("markets")} 
          title="Protocols Tracker" 
          className={`p-1.5 transition-all rounded-sm ${activeTab === "markets" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600"}`}
        >
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
