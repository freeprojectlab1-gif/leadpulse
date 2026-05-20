const fs = require('fs');
const filePath = 'frontend/src/components/CricketFun.jsx';
let data = fs.readFileSync(filePath, 'utf8');

const replacement = `  const getPremiumSvgLogo = (shortName, color1, color2) => {
    const svg = \`<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad_\${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="\${color1}" />
          <stop offset="100%" stop-color="\${color2}" />
        </linearGradient>
        <linearGradient id="glow_\${shortName}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
        </linearGradient>
        <filter id="shadow_\${shortName}">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.5"/>
        </filter>
      </defs>
      
      <!-- Outer Shield -->
      <path d="M 100,10 L 180,40 L 180,110 C 180,160 100,190 100,190 C 100,190 20,160 20,110 L 20,40 Z" 
            fill="url(#grad_\${shortName})" 
            stroke="url(#glow_\${shortName})" stroke-width="4" filter="url(#shadow_\${shortName})"/>
            
      <!-- Inner Design -->
      <path d="M 100,25 L 160,50 L 160,105 C 160,140 100,170 100,170 C 100,170 40,140 40,105 L 40,50 Z" 
            fill="#111827" opacity="0.9" />
            
      <!-- Text -->
      <text x="100" y="125" font-family="Arial, sans-serif" font-weight="900" font-size="65" 
            text-anchor="middle" fill="#ffffff" filter="url(#shadow_\${shortName})" letter-spacing="2">
        \${shortName}
      </text>
      
      <!-- Top Accent -->
      <path d="M 60,60 L 100,45 L 140,60 L 100,75 Z" fill="url(#grad_\${shortName})" />
    </svg>\`;
    
    return \`data:image/svg+xml;base64,\${btoa(svg)}\`;
  };

  const getTeamLogo = (teamName, sizeClass = "w-12 h-12") => {
    if (!teamName) return '🏏';
    const urls = {
      'MI': '/logos/mi.png',
      'KKR': '/logos/kkr.png',
      'DC': '/logos/dc.png',
      'SRH': '/logos/srh.png',
      'PBKS': getPremiumSvgLogo('PBKS', '#ef4444', '#f59e0b'), // Red & Gold
      'RR': getPremiumSvgLogo('RR', '#ec4899', '#3b82f6'),   // Pink & Blue
      'GT': getPremiumSvgLogo('GT', '#1e3a8a', '#eab308'),   // Dark Blue & Gold
      'LSG': getPremiumSvgLogo('LSG', '#0ea5e9', '#f97316')  // Light Blue & Orange
    };
    
    const searchName = String(teamName).toUpperCase();
    const team = IPL_TEAMS.find(t => t.name.toUpperCase() === searchName || t.short.toUpperCase() === searchName);
    const shortName = team ? team.short : teamName;
    
    if (urls[shortName]) {
      return (
        <div className={\`\${sizeClass} flex items-center justify-center p-1 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/40 overflow-hidden group\`}>
          <img 
            src={urls[shortName]} 
            alt={shortName} 
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500 ease-out" 
          />
        </div>
      );
    }
    return team ? <span className="drop-shadow-lg text-4xl">{team.logo}</span> : '🏏';
  };`;

// replace everything from getTeamLogo definition to the end of it
const getTeamLogoRegex = /const getTeamLogo = \(teamName, sizeClass = "w-12 h-12"\) => \{[\s\S]*?return team \? <span className="drop-shadow-lg text-4xl">\{team\.logo\}<\/span> : '🏏';\s*\};/;
data = data.replace(getTeamLogoRegex, replacement);

fs.writeFileSync(filePath, data);
console.log('Successfully injected SVG premium logos');
