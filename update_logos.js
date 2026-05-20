const fs = require('fs');
const filePath = 'frontend/src/components/CricketFun.jsx';
let data = fs.readFileSync(filePath, 'utf8');

const targetFunction = `  const getTeamLogo = (teamName) => {
    const team = IPL_TEAMS.find(t => t.name === teamName || t.short === teamName);
    return team ? team.logo : '🏏';
  };`;

const replacementFunction = `  const getTeamLogo = (teamName, sizeClass = "w-10 h-10") => {
    const urls = {
      'MI': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png',
      'KKR': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png',
      'DC': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Delhi_Capitals.svg/200px-Delhi_Capitals.svg.png',
      'SRH': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Sunrisers_Hyderabad.svg/200px-Sunrisers_Hyderabad.svg.png',
      'PBKS': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
      'RR': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
      'GT': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/200px-Gujarat_Titans_Logo.svg.png',
      'LSG': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/200px-Lucknow_Super_Giants_IPL_Logo.svg.png'
    };
    
    const team = IPL_TEAMS.find(t => t.name === teamName || t.short === teamName);
    const shortName = team ? team.short : teamName;
    
    if (urls[shortName]) {
      return <img src={urls[shortName]} alt={shortName} className={\`\${sizeClass} object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-110 transition-transform duration-300\`} />;
    }
    return team ? <span className="drop-shadow-lg text-4xl">{team.logo}</span> : '🏏';
  };`;

// replace CRLF with LF for the search to match exactly
data = data.replace(/\r\n/g, '\n');
if (data.includes(targetFunction)) {
    data = data.replace(targetFunction, replacementFunction);
    fs.writeFileSync(filePath, data);
    console.log('Successfully updated getTeamLogo');
} else {
    console.log('Could not find target function. Writing the data out to verify.');
    fs.writeFileSync('temp_debug.txt', data.substring(data.indexOf('getTeamLogo') - 100, data.indexOf('getTeamLogo') + 300));
}
