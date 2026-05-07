import React, { useEffect, useState, useRef } from 'react';
import { 
  Rocket, 
  Map, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Globe, 
  Layers, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Database,
  Search,
  Activity,
  Cpu,
  Fingerprint,
  Box,
  Layout,
  Command,
  Zap,
  MousePointer2,
  Target,
  Mail,
  Smartphone,
  Server,
  Code2,
  QrCode,
  FolderLock,
  Star,
  Quote,
  Plus,
  Minus,
  Network,
  Maximize2,
  Menu,
  X
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from './components/ui';

const LandingPage = ({ onGetStarted }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      // Only rotate on non-touch devices or larger screens to avoid weird mobile behavior
      if (window.innerWidth > 768) {
        const xRot = (window.innerHeight / 2 - e.clientY) / 25;
        const yRot = (e.clientX - window.innerWidth / 2) / 25;
        setRotation({ x: xRot, y: yRot });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showcaseItems = [
    { title: "Quantum Dashboard", tag: "CORE", src: "/ss_backend/Screenshot from 2026-05-07 12-58-23.png", icon: <Layout size={20} /> },
    { title: "Grid Map Scraper", tag: "EXTRACTION", src: "/ss_backend/Screenshot from 2026-05-07 13-26-50.png", icon: <Map size={20} /> },
    { title: "Email Intelligence", tag: "ENRICH", src: "/ss_backend/Screenshot from 2026-05-07 13-27-01.png", icon: <Zap size={20} /> },
    { title: "Response Protocol", tag: "REPLIES", src: "/ss_backend/Screenshot from 2026-05-07 13-27-23.png", icon: <MessageCircle size={20} /> },
    { title: "WhatsApp Linker", tag: "AUTOMATE", src: "/ss_backend/Screenshot from 2026-05-07 13-28-40.png", icon: <QrCode size={20} /> },
    { title: "Template Vault", tag: "ASSETS", src: "/ss_backend/Screenshot from 2026-05-07 13-28-17.png", icon: <FolderLock size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#010206] text-slate-400 selection:bg-primary/30 selection:text-white overflow-x-hidden font-sans scroll-smooth perspective-2000">
      {/* ── Spotlight ── */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100] opacity-40 hidden md:block"
        style={{
          background: `radial-gradient(1000px at ${mousePos.x}px ${mousePos.y}px, rgba(66, 120, 244, 0.12), transparent 80%)`
        }}
      />

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-3d">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* ── Responsive Navbar ── */}
      <nav className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[200]">
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-[2rem] px-4 md:px-8 py-2 md:py-3.5 flex items-center justify-between shadow-2xl transition-all">
          <div className="flex items-center gap-2 md:gap-3 font-black text-lg md:text-2xl tracking-tighter cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-glow-primary group-hover:rotate-12 transition-all">
              <Rocket size={16} className="text-white md:hidden" />
              <Rocket size={20} className="text-white hidden md:block" />
            </div>
            <span className="text-white">LeadPulse</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            {['Engine', 'Features', 'Showcase', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.4em]">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors" onClick={onGetStarted}>Sign In</button>
            <Button size="sm" className="rounded-xl md:rounded-2xl h-9 md:h-11 px-6 md:px-10 shadow-3d-primary font-black uppercase tracking-widest text-[9px] group" onClick={onGetStarted}>
              Launch
            </Button>
            <button className="lg:hidden text-white p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full mt-2 p-6 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-6">
              {['Engine', 'Features', 'Showcase', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-xs font-black text-slate-400 hover:text-primary uppercase tracking-[0.4em]">{item}</a>
              ))}
              <hr className="border-white/5" />
              <Button onClick={onGetStarted} className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]">Get Started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section id="engine" className="relative pt-40 md:pt-64 pb-32 md:pb-48 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-10 md:mb-14">
            <Zap size={10} className="animate-pulse" /> Autonomous Outreach Protocol
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-8 md:mb-12 text-white">
            ELITE <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-shimmer">INTELLIGENCE.</span>
          </h1>

          <p className="text-xs md:text-lg text-slate-500 max-w-2xl mx-auto mb-12 md:mb-20 leading-relaxed font-medium">
            The world's most aggressive B2B engine. Deploy autonomous grid-scrapers, 
            human-like routing, and deep-scan analytics in one immersive dashboard.
          </p>

          {/* ── 3D Mockup (Responsive Scaling) ── */}
          <div 
            className="w-full max-w-5xl mx-auto relative group perspective-2000 transition-all duration-300 ease-out preserve-3d"
            style={{ 
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            }}
          >
            <div className="absolute -inset-10 md:-inset-20 bg-primary/20 rounded-[3rem] md:rounded-[5rem] blur-[80px] md:blur-[150px] opacity-40 group-hover:opacity-70 transition-opacity"></div>
            
            {/* Floating Details (Hidden on small screens) */}
            <div className="hidden lg:block absolute -top-10 -right-20 w-40 h-40 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-3d animate-float-3d" style={{ transform: `translateZ(100px)` }}>
              <div className="flex flex-col gap-4">
                <Activity size={24} className="text-emerald-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Throughput</p>
                <p className="text-lg font-black text-white leading-none">94.8%</p>
              </div>
            </div>

            <div className="relative bg-[#080c16] border border-white/10 rounded-3xl md:rounded-[4rem] p-1 md:p-3 shadow-2xl overflow-hidden transform-3d">
              <img 
                src="/ss_backend/Screenshot from 2026-05-07 12-58-23.png" 
                alt="Dashboard" 
                className="w-full rounded-2xl md:rounded-[3.5rem] shadow-2xl" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento (Fully Responsive Stacking) ── */}
      <section id="features" className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 md:mb-32">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">Built for Dominance.</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed px-4">Every component is engineered for information-density and extreme scale.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
            {/* Large Feature */}
            <div className="sm:col-span-2 lg:col-span-3 lg:row-span-2 group relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-8 md:p-12 hover:border-primary/40 transition-all">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center mb-8 shadow-glow-primary group-hover:scale-110 transition-transform">
                    <Map size={24} className="text-primary md:hidden" />
                    <Map size={32} className="text-primary hidden md:block" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">Geocoding Bypass</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">Proprietary grid-scanning technology that harvests thousands of verified leads in real-time.</p>
                </div>
                <div className="p-6 md:p-8 bg-black/60 rounded-2xl md:rounded-[2.5rem] border border-white/5 backdrop-blur-2xl">
                  <div className="flex gap-1.5 h-12 md:h-16 items-end">
                    {[40,80,60,100,75,95,50,85,65,90,70].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* WA Core */}
            <div className="sm:col-span-2 lg:col-span-3 group relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-8 md:p-12 hover:border-emerald-500/40 transition-all min-h-[300px] md:min-h-[400px]">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-8">
                      <MessageCircle size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">WhatsApp Core</h3>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-sm">Human-like protocols for 100% account safety at scale.</p>
                  </div>
                  <div className="hidden sm:flex w-24 h-24 bg-emerald-500/5 rounded-full border border-emerald-500/10 items-center justify-center animate-spin-slow">
                    <Fingerprint className="w-10 h-10 text-emerald-500/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Small Blocks */}
            {[
              { icon: <BarChart3 size={20} className="text-blue-500" />, title: "Live Intel" },
              { icon: <Database size={20} className="text-purple-500" />, title: "Secure Vault" },
              { icon: <Cpu size={20} className="text-amber-500" />, title: "Auto Scale" }
            ].map((f, i) => (
              <div key={i} className="lg:col-span-1 group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.01] p-6 md:p-8 hover:bg-white/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{f.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase (Mobile Friendly Tabs) ── */}
      <section id="showcase" className="py-24 md:py-40 px-6 bg-white/[0.01] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 md:mb-32 px-4">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">The Full Protocol.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">
            {/* Horizontal Scroll on Mobile Tabs */}
            <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 px-2 lg:px-0 no-scrollbar">
              {showcaseItems.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 lg:flex-shrink-1 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border cursor-pointer transition-all duration-500 flex items-center gap-4 ${activeTab === i ? 'bg-white/10 border-primary shadow-glow-sm min-w-[200px] lg:min-w-0' : 'bg-transparent border-white/5 opacity-30 min-w-[180px] lg:min-w-0'}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${activeTab === i ? 'bg-primary text-white' : 'bg-white/5 text-primary'}`}>
                    {item.icon}
                  </div>
                  <h5 className="font-black text-white text-[9px] md:text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">{item.title}</h5>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8 perspective-2000">
              <div className="relative group p-1 md:p-2 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-[2rem] md:rounded-[3.5rem]">
                <div className="relative bg-[#080c16] border border-white/10 rounded-2xl md:rounded-[3.2rem] p-1 md:p-2 shadow-2xl overflow-hidden">
                  <img 
                    src={showcaseItems[activeTab].src} 
                    alt={showcaseItems[activeTab].title} 
                    className="w-full rounded-xl md:rounded-[3rem] shadow-2xl animate-in fade-in zoom-in duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16]/70 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing (Responsive Cards) ── */}
      <section id="pricing" className="py-24 md:py-40 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-12 md:mb-20 tracking-tighter leading-none px-4">TOTAL <br className="md:hidden" /> DOMINANCE.</h2>
          
          <div className="relative group p-1 md:p-2 bg-gradient-to-br from-primary via-blue-500 to-emerald-500 rounded-[2.5rem] md:rounded-[4.5rem] transition-all">
            <Card className="bg-[#010206] border-none rounded-[2.3rem] md:rounded-[4.2rem] p-8 md:p-20 overflow-hidden relative">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 text-center lg:text-left">
                <div className="max-w-xl">
                  <Badge className="mb-6 md:mb-8 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-none font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px]">Lifetime Node</Badge>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                    <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">₹2,999</span>
                    <span className="text-slate-500 font-black text-lg md:text-xl uppercase tracking-widest">/LIFE</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-center sm:text-left">
                    {['Unlimited Extraction', 'Unlimited Campaigns', 'Global Access', 'Cloud Sync', 'Intel Support', 'Future v4'].map(item => (
                      <div key={item} className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 size={14} className="text-primary shrink-0" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full lg:w-auto">
                  <Button size="lg" className="h-16 md:h-20 px-10 md:px-16 rounded-2xl md:rounded-[2.5rem] text-[11px] md:text-sm font-black shadow-glow-primary group w-full" onClick={onGetStarted}>
                    <span className="relative z-10 flex items-center justify-center gap-4">Claim Your Node <ArrowRight size={20} /></span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Compact Footer ── */}
      <footer className="py-20 md:py-32 px-6 border-t border-white/5 relative z-10 bg-[#010206]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 font-black text-2xl tracking-tighter text-white mb-6">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <Rocket size={18} className="text-black" />
              </div>
              LeadPulse
            </div>
            <p className="text-slate-700 max-w-xs text-[10px] font-black leading-relaxed uppercase tracking-[0.3em] opacity-50 mx-auto md:mx-0">
              Autonomous growth infrastructure. <br/> Optimized for information-density.
            </p>
          </div>

          <div className="flex gap-8 md:gap-14 text-slate-800">
            {[Instagram, Facebook, Linkedin, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-primary transition-all hover:scale-110"><Icon size={20} /></a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.6em]">© 2026 LEADPULSE INTEL. ALL SYSTEMS NOMINAL.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
