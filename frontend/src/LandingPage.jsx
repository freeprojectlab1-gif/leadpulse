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
  Cpu as CpuIcon
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from './components/ui';

const LandingPage = ({ onGetStarted }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      // Intense 3D Rotation Calculation
      const xRot = (window.innerHeight / 2 - e.clientY) / 20;
      const yRot = (e.clientX - window.innerWidth / 2) / 20;
      setRotation({ x: xRot, y: yRot });
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
      {/* ── Intense 3D Spotlight Layer ── */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-500"
        style={{
          background: `radial-gradient(1000px at ${mousePos.x}px ${mousePos.y}px, rgba(66, 120, 244, 0.12), transparent 80%)`
        }}
      />

      {/* ── Parallax Background Elements ── */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-3d">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.04] mix-blend-overlay"></div>
        
        {/* Floating 3D Cubes/Orbs */}
        <div className="absolute top-[15%] left-[5%] w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" style={{ transform: `translateZ(-100px)` }}></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '3s', transform: `translateZ(-200px)` }}></div>
        
        {/* Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* ── 3D Floating Navbar ── */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-[200]">
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] px-8 py-3.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-3d hover:translate-y-[-2px] transition-all">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow-primary group-hover:rotate-[20deg] transition-all duration-500">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="text-white tracking-tight">LeadPulse <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded-full ml-1 uppercase">v3.0</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Engine', 'Features', 'Showcase', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.4em] relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors" onClick={onGetStarted}>Sign In</button>
            <Button size="sm" className="rounded-2xl h-11 px-10 shadow-3d-primary font-black uppercase tracking-widest text-[10px] group relative overflow-hidden" onClick={onGetStarted}>
              <span className="relative z-10">Launch Engine</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Ultra 3D Hero ── */}
      <section id="engine" className="relative pt-64 pb-48 px-6 perspective-2000 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.4em] mb-14 shadow-glow-sm animate-reveal">
            <Zap size={10} className="animate-pulse" /> Global Prospecting Infrastructure
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-10 text-white animate-reveal select-none" style={{ animationDelay: '0.1s' }}>
            ELITE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-shimmer">INTELLIGENCE.</span>
          </h1>

          <p className="text-sm md:text-xl text-slate-500 max-w-3xl mx-auto mb-20 leading-relaxed font-medium animate-reveal" style={{ animationDelay: '0.2s' }}>
            The world's most aggressive B2B engine. Deploy autonomous grid-scrapers, 
            human-like routing, and deep-scan analytics in one immersive 3D dashboard.
          </p>

          {/* ── Intense 3D Dashboard Mockup ── */}
          <div 
            className="w-full max-w-6xl mx-auto relative group perspective-2000 transition-all duration-300 ease-out preserve-3d animate-reveal"
            style={{ 
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              animationDelay: '0.4s'
            }}
          >
            {/* Massive Glow Behind */}
            <div className="absolute -inset-20 bg-primary/20 rounded-[5rem] blur-[150px] opacity-60 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Floating 3D Elements around mockup */}
            <div className="absolute -top-10 -right-20 w-40 h-40 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-3d animate-float-3d" style={{ transform: `translateZ(100px)` }}>
              <div className="flex flex-col gap-4">
                <Activity size={24} className="text-emerald-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Throughput</p>
                <p className="text-lg font-black text-white leading-none">94.8%</p>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -left-20 w-48 h-32 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-3d animate-float-3d" style={{ transform: `translateZ(150px)`, animationDelay: '2s' }}>
              <div className="flex flex-col gap-3">
                <Database size={24} className="text-primary" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Leads Synced</p>
                <p className="text-xl font-black text-white leading-none">12,482</p>
              </div>
            </div>

            <div className="relative bg-[#080c16] border border-white/10 rounded-[4rem] p-3 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.9)] overflow-hidden glare-effect transform-3d">
              <div className="absolute top-6 left-12 flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <img 
                src="/ss_backend/Screenshot from 2026-05-07 12-58-23.png" 
                alt="Main Dashboard" 
                className="w-full rounded-[3.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3D Bento Grid (Deep Tilt) ── */}
      <section id="features" className="py-40 px-6 perspective-2000">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <Badge className="mb-6 rounded-full px-5 py-2 bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] shadow-glow-sm">Modular Infrastructure</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter leading-none">Built for Dominance.</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto font-medium">Every component is engineered for information-density and extreme scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Grid Scraper (Large) */}
            <div className="md:col-span-3 md:row-span-2 group relative overflow-hidden rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-12 hover:border-primary/40 transition-all duration-700 perspective-1000 transform-3d hover:translate-z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 shadow-glow-primary group-hover:scale-110 group-hover:rotate-12 transition-all">
                    <Map size={28} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Geocoding Bypass</h3>
                  <p className="text-slate-500 text-base leading-relaxed mb-10">Proprietary grid-scanning technology that harvests thousands of verified leads across metropolitan areas in real-time.</p>
                </div>
                <div className="p-10 bg-black/60 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl glare-effect">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Node Extraction Stream</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 px-3 h-6 text-[9px] font-black">ACTIVE</Badge>
                  </div>
                  <div className="flex gap-2 h-20 items-end">
                    {[40,80,60,100,75,95,50,85,65,90,70,55,80,95].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all duration-500" style={{ height: `${h}%`, transitionDelay: `${i*30}ms` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* WA Core (Medium) */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-12 hover:border-emerald-500/40 transition-all duration-700 min-h-[450px] transform-3d hover:translate-z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-8 group-hover:rotate-[20deg] transition-all">
                      <MessageCircle size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">WhatsApp Core v4</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">Human-like delay protocols and session warm-ups for 100% account safety at massive scale.</p>
                  </div>
                  <div className="w-32 h-32 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center justify-center animate-spin-slow">
                    <Fingerprint className="w-12 h-12 text-emerald-500/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Small 3D Blocks */}
            {[
              { icon: <BarChart3 className="text-blue-500" />, title: "Live Intel", desc: "Real-time delivery." },
              { icon: <Database className="text-purple-500" />, title: "Secure Vault", desc: "Encrypted storage." },
              { icon: <CpuIcon className="text-amber-500" />, title: "Auto Scale", desc: "Distributed nodes." }
            ].map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.01] p-10 hover:border-white/20 transition-all transform-3d hover:translate-z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-3">{f.title}</h4>
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D Platform Showcase (Deep Tilted) ── */}
      <section id="showcase" className="py-40 px-6 bg-white/[0.01] relative overflow-hidden perspective-2000">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <Badge className="mb-8 rounded-full px-5 py-2 bg-emerald-500/10 text-emerald-400 border-none font-black uppercase tracking-widest text-[9px]">Deep-Scan Tour</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter leading-none">Every Angle. Re-Engineered.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-4 space-y-4 transform-3d">
              {showcaseItems.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(i)}
                  className={`group p-6 rounded-[2.5rem] border cursor-pointer transition-all duration-500 flex items-center gap-6 ${activeTab === i ? 'bg-white/10 border-primary shadow-glow-sm scale-105 translate-x-4' : 'bg-transparent border-white/5 opacity-30 hover:opacity-100 hover:translate-x-2'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeTab === i ? 'bg-primary text-white shadow-glow-primary' : 'bg-white/5 text-primary'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-black text-white text-[11px] uppercase tracking-[0.3em]">{item.title}</h5>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="ghost" className="text-[8px] h-5 px-3 border-white/10 text-slate-500 font-black">{item.tag}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8 perspective-2000 transform-3d">
              <div 
                className="relative group p-2 bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-[4rem] transition-all duration-1000 rotate-y-12 group-hover:rotate-y-0 shadow-[0_100px_150px_-50px_rgba(66,120,244,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative bg-[#080c16] border border-white/10 rounded-[3.8rem] p-3 shadow-3d overflow-hidden glare-effect">
                  <div className="absolute top-6 right-10 flex gap-2 z-20">
                    <div className="h-2 w-2 rounded-full bg-red-500/30"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500/30"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500/30"></div>
                  </div>
                  <img 
                    src={showcaseItems[activeTab].src} 
                    alt={showcaseItems[activeTab].title} 
                    className="w-full rounded-[3.2rem] shadow-2xl animate-in fade-in zoom-in duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16]/70 to-transparent"></div>
                  
                  {/* Hover 3D Detail */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="p-8 bg-primary/10 backdrop-blur-2xl border border-primary/20 rounded-[3rem] scale-0 group-hover:scale-100 transition-transform duration-700">
                      <Maximize2 size={48} className="text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3D Cosmic Network Section ── */}
      <section className="py-60 px-6 bg-[#02040a] relative overflow-hidden perspective-2000">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="lg:w-1/2 relative transform-3d group">
            <div className="w-[500px] h-[500px] rounded-full border border-primary/10 flex items-center justify-center animate-spin-slow">
              <div className="w-[400px] h-[400px] rounded-full border border-primary/5 flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-full border border-primary/5 flex items-center justify-center p-12 bg-primary/5 shadow-inner">
                  <Network size={80} className="text-primary animate-pulse" />
                </div>
              </div>
              {/* Orbits */}
              <div className="absolute w-12 h-12 bg-black border border-primary rounded-2xl flex items-center justify-center animate-orbit shadow-glow-primary">
                <Database size={20} className="text-primary" />
              </div>
              <div className="absolute w-10 h-10 bg-black border border-emerald-500 rounded-2xl flex items-center justify-center animate-orbit shadow-glow-emerald" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <Zap size={18} className="text-emerald-500" />
              </div>
            </div>
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          
          <div className="lg:w-1/2">
            <Badge className="mb-8 rounded-full px-5 py-2 bg-primary/10 text-primary border-none font-black uppercase tracking-[0.4em] text-[9px]">Autonomous Network</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tighter leading-none animate-reveal">Global <br/> Reach.</h2>
            <div className="grid grid-cols-2 gap-10">
              {[
                { label: "EXTRACTIONS", val: "8.2M", icon: <Layers /> },
                { label: "NODES ACTIVE", val: "1,248", icon: <Server /> },
                { label: "DAILY INTEL", val: "150K", icon: <Sparkles /> },
                { label: "ACCURACY", val: "99.8%", icon: <CheckCircle2 /> }
              ].map((s, i) => (
                <div key={i} className="group cursor-default transform-3d hover:translate-z-10 transition-all">
                  <div className="text-primary/40 mb-3 group-hover:text-primary transition-colors">{s.icon}</div>
                  <div className="text-4xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{s.val}</div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing (Elite 3D Card) ── */}
      <section id="pricing" className="py-40 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-16 tracking-tighter leading-none animate-reveal">TOTAL <br/> DOMINANCE.</h2>
          
          <div 
            className="relative group p-2 bg-gradient-to-br from-primary via-blue-500 to-emerald-500 rounded-[4.5rem] transition-all duration-1000 transform-3d hover:scale-[1.03] shadow-[0_100px_150px_-50px_rgba(66,120,244,0.3)]"
          >
            <Card className="bg-[#010206] border-none rounded-[4.2rem] p-16 md:p-24 overflow-hidden relative shadow-2xl">
              <div className="absolute -top-60 -right-60 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[150px] group-hover:opacity-100 opacity-40 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-20 text-left">
                <div className="max-w-xl">
                  <Badge className="mb-8 rounded-full px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-[0.4em] text-[10px] shadow-glow-sm">Lifetime Intelligence Node</Badge>
                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-7xl font-black text-white tracking-tighter">₹2,999</span>
                    <span className="text-slate-500 font-black text-xl uppercase tracking-widest">/LIFE</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    {['Unlimited Extraction', 'Unlimited Campaigns', 'Global Commands', 'Cloud Node Access', '24/7 Intel Support', 'Future Updates'].map(item => (
                      <div key={item} className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest group/item">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                          <CheckCircle2 size={12} className="text-primary group-hover/item:text-white" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <Button size="lg" className="h-24 px-16 rounded-[2.5rem] text-sm font-black shadow-glow-primary group relative overflow-hidden uppercase tracking-[0.5em] w-full" onClick={onGetStarted}>
                    <span className="relative z-10 flex items-center gap-5">Claim Node <ArrowRight size={24} /></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Button>
                  <p className="text-center mt-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">One-time payment. Infinite growth.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer (Elite Depth) ── */}
      <footer className="py-40 px-6 border-t border-white/5 relative z-10 bg-[#010206]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 font-black text-4xl tracking-tighter text-white mb-10">
              <div className="w-12 h-12 bg-white rounded-[1.2rem] flex items-center justify-center shadow-2xl">
                <Rocket size={24} className="text-black" />
              </div>
              LeadPulse
            </div>
            <p className="text-slate-700 max-w-sm text-xs font-black leading-relaxed uppercase tracking-[0.4em] opacity-50">
              The standard in autonomous growth infrastructure. <br/> Built for performance, optimized for scale.
            </p>
          </div>
          <div className="space-y-8">
            <h6 className="font-black text-white uppercase tracking-[0.4em] text-[11px]">Infrastructure</h6>
            <div className="flex flex-col gap-5 text-[10px] font-black text-slate-700 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Extraction Node</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Routing Engine</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Intel Dashboard</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Cloud Sync</a>
            </div>
          </div>
          <div className="space-y-8">
            <h6 className="font-black text-white uppercase tracking-[0.4em] text-[11px]">Command Hub</h6>
            <div className="flex flex-col gap-5 text-[10px] font-black text-slate-700 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Documentation</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Security Protocol</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Privacy Node</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">API Status</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.8em]">© 2026 LEADPULSE INTEL. ALL SYSTEMS NOMINAL.</p>
          <div className="flex gap-14 text-slate-900">
            {[Instagram, Facebook, Linkedin, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-primary transition-all hover:scale-125"><Icon size={24} /></a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
