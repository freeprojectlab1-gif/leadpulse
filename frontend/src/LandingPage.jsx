import React from 'react';
import { 
  Rocket, 
  Map, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Globe, 
  Users, 
  Layers, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MousePointer2,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from './components/ui';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">
            <div className="bg-primary p-1.5 rounded-lg">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span>LeadPulse <span className="text-primary text-sm font-bold ml-1 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 uppercase tracking-widest">v2.0</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#analytics" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Analytics</a>
            <a href="#prospecting" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Prospecting</a>
            <div className="w-px h-4 bg-border/60 mx-2"></div>
            <Button variant="ghost" className="text-sm font-bold" onClick={onGetStarted}>Sign In</Button>
            <Button className="rounded-full px-6 shadow-glow-primary font-bold group" onClick={onGetStarted}>
              Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-8 py-1.5 px-4 rounded-full bg-primary/5 border-primary/20 text-primary font-bold animate-fade-in tracking-wider uppercase text-[10px]">
            <Sparkles className="w-3 h-3 mr-2" /> The Future of B2B Prospecting is Here
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1] mb-8 animate-slide-up">
            Automate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-shimmer">
              Growth Engine.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            The all-in-one outreach infrastructure for modern sales teams. 
            Extract leads from Google Maps, run WhatsApp campaigns, and track everything in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <Button size="lg" className="rounded-2xl h-16 px-10 text-base font-bold shadow-2xl shadow-primary/20 group relative overflow-hidden" onClick={onGetStarted}>
              <span className="relative z-10 flex items-center gap-2">
                Deploy Your Infrastructure <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10 border-border/60 hover:bg-muted/50 font-bold">
              Watch Demo video
            </Button>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2rem] overflow-hidden shadow-2xl p-4">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 mb-4 bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
                <div className="mx-auto text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">leadpulse-production-v2.dashboard</div>
              </div>
              <div className="grid grid-cols-12 gap-4 h-[400px]">
                <div className="col-span-3 border-r border-border/20 p-4 space-y-4">
                  <div className="h-8 bg-primary/10 rounded-lg animate-pulse w-full"></div>
                  <div className="h-8 bg-muted/40 rounded-lg w-[80%]"></div>
                  <div className="h-8 bg-muted/40 rounded-lg w-[90%]"></div>
                  <div className="h-8 bg-muted/40 rounded-lg w-[70%]"></div>
                </div>
                <div className="col-span-9 p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-card/50 border border-border/30 rounded-2xl p-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg mb-2"></div>
                      <div className="h-3 bg-muted/40 rounded w-12 mb-1"></div>
                      <div className="h-5 bg-foreground/10 rounded w-20"></div>
                    </div>
                    <div className="h-24 bg-card/50 border border-border/30 rounded-2xl p-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg mb-2"></div>
                      <div className="h-3 bg-muted/40 rounded w-12 mb-1"></div>
                      <div className="h-5 bg-foreground/10 rounded w-16"></div>
                    </div>
                    <div className="h-24 bg-card/50 border border-border/30 rounded-2xl p-4">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg mb-2"></div>
                      <div className="h-3 bg-muted/40 rounded w-12 mb-1"></div>
                      <div className="h-5 bg-foreground/10 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-[200px] bg-muted/10 rounded-2xl border border-border/20 flex flex-col justify-end p-4 gap-2">
                    <div className="flex items-end gap-2 h-full">
                      <div className="flex-1 bg-primary/20 h-[40%] rounded-t-lg"></div>
                      <div className="flex-1 bg-primary/30 h-[60%] rounded-t-lg"></div>
                      <div className="flex-1 bg-primary/40 h-[90%] rounded-t-lg animate-pulse"></div>
                      <div className="flex-1 bg-primary/20 h-[30%] rounded-t-lg"></div>
                      <div className="flex-1 bg-primary/50 h-[75%] rounded-t-lg"></div>
                      <div className="flex-1 bg-primary/40 h-[50%] rounded-t-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="py-12 border-y border-border/40 bg-muted/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale opacity-60">
          <div className="flex items-center gap-2 font-bold text-lg"><ShieldCheck className="w-5 h-5" /> Enterprise Secure</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Globe className="w-5 h-5" /> Global Access</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5" /> 24/7 Automation</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Users className="w-5 h-5" /> 500+ Active Teams</div>
        </div>
      </div>

      {/* ── Features Section ── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Powerful Modules for Growth</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed text-lg">
              Everything you need to find, reach, and convert your ideal business leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Map,
                title: "City-Level Scraper",
                desc: "Extract detailed business data from Google Maps across any city in India.",
                color: "from-primary/20 to-primary/5"
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Engine",
                desc: "Smart WhatsApp outreach with automated delays and session management.",
                color: "from-emerald-500/20 to-emerald-500/5"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                desc: "Track delivery, open rates, and engagement with deep performance metrics.",
                color: "from-blue-500/20 to-blue-500/5"
              },
              {
                icon: Layers,
                title: "Advanced Filters",
                desc: "Target businesses with or without websites, based on ratings and more.",
                color: "from-purple-500/20 to-purple-500/5"
              }
            ].map((f, i) => (
              <Card key={i} className="group border-border/40 hover:border-primary/40 bg-card/40 transition-all duration-300 hover:translate-y-[-8px] shadow-sm hover:shadow-2xl overflow-hidden rounded-3xl">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual Section (The "How it works") ── */}
      <section className="py-32 px-6 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <Badge className="mb-6 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Prospecting Intelligence</Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Smart City-Wide Extraction.</h2>
            <div className="space-y-6">
              {[
                { title: "No Radius Limits", desc: "Bypass standard map constraints with our geocoding-powered engine." },
                { title: "Anti-Ban Protection", desc: "Randomized human-like interactions to keep your accounts safe." },
                { title: "Multi-Worker Power", 6: "Scale up to 10 concurrent browser instances for maximum speed." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                    {i+1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-background border border-border/50 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="font-bold text-sm tracking-tight">Active Scraper Session</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                </div>
              </div>
              <div className="space-y-3 font-mono text-xs overflow-hidden">
                <div className="text-primary/60">[SCN] Initializing Nominatim Geocoder...</div>
                <div className="text-primary/60">[SCN] Target: Ahmedabad, Gujarat (120km Radius)</div>
                <div className="text-emerald-500/80">[RES] Found: "Aadarsh Driving School" - 9876543210</div>
                <div className="text-emerald-500/80">[RES] Found: "Mehta Auto Parts" - 9988776655</div>
                <div className="text-emerald-500/80">[RES] Found: "Surat Diamond Hub" - 9122334455</div>
                <div className="text-primary/60 animate-pulse">[SCN] Auto-scrolling viewport for more results...</div>
                <div className="flex items-center gap-2 pt-4">
                  <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%] animate-pulse"></div>
                  </div>
                  <span className="text-[10px] font-bold opacity-50">65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing / CTA Section ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">Ready to scale your business?</h2>
          <p className="text-xl text-muted-foreground mb-12 font-medium max-w-2xl mx-auto">
            Join the elite teams using LeadPulse to dominate their market with automated prospecting.
          </p>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full">LIMITED ACCESS</Badge>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black tracking-tighter">₹2,999</span>
                  <span className="text-muted-foreground font-bold">/lifetime</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-[200px]">Unlimited leads, unlimited messages, lifetime updates.</p>
              </div>
              <Button size="lg" className="h-16 px-10 rounded-2xl text-base font-bold shadow-glow-primary group w-full md:w-auto" onClick={onGetStarted}>
                Secure Your Access Now <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 px-6 border-t border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter grayscale opacity-50">
            <div className="bg-foreground p-1.5 rounded-lg">
              <Rocket className="w-6 h-6 text-background" />
            </div>
            <span>LeadPulse</span>
          </div>
          
          <div className="flex gap-10 text-sm font-semibold text-muted-foreground/60">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          </div>

          <div className="flex gap-4">
            {[Instagram, Facebook, Linkedin, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/60 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
            © 2026 LeadPulse Technologies. Built for the modern growth engine.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
