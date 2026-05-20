const fs = require('fs');
const filePath = 'frontend/src/components/CricketFun.jsx';
let data = fs.readFileSync(filePath, 'utf8');

// Replace Header text with a gradient
data = data.replace(
  'Cricket Fun <span className="text-primary">IPL 2024</span>',
  '<span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">Cricket Fun</span> <span className="text-primary">IPL 2024</span>'
);

// Enhance top stats cards
data = data.replace(
  /className="premium-card bg-gradient-to-br from-primary\/10 to-transparent border-primary\/20"/g,
  'className="premium-card bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"'
);

// Enhance TabsList
data = data.replace(
  'className="grid w-full grid-cols-4 lg:w-[600px] mb-8 p-1 bg-muted/30 border border-border/50 rounded-2xl"',
  'className="grid w-full grid-cols-4 lg:w-[600px] mb-8 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl"'
);

// Enhance TabsTriggers
data = data.replace(
  /className="rounded-xl data-\[state=active\]:bg-background data-\[state=active\]:shadow-sm"/g,
  'className="rounded-xl font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-all duration-300"'
);

// Enhance points table container
data = data.replace(
  '<Card className="premium-card overflow-hidden">',
  '<Card className="premium-card overflow-hidden bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">'
);

// Enhance table rows (generic replacement for border-t border-border/20 text-white)
data = data.replace(
  /className="border-t border-border\/20 text-white"/g,
  'className="border-t border-white/5 text-white hover:bg-white/[0.03] transition-colors duration-300"'
);

// Enhance standard table headers
data = data.replace(
  /className="bg-muted\/30 text-xs text-muted-foreground uppercase tracking-wider font-black"/g,
  'className="bg-black/60 backdrop-blur-md text-xs text-slate-400 uppercase tracking-widest font-black border-b border-white/10"'
);

// Enhance general cards
data = data.replace(
  /className="premium-card"/g,
  'className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl"'
);

// Write changes back
fs.writeFileSync(filePath, data);
console.log('Successfully updated CricketFun.jsx design');
