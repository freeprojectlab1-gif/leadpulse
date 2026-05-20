const fs = require('fs');
const path = 'backend/cricket_data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const TEAM_FULL_NAMES = {
  'MI': 'Mumbai Indians', 'CSK': 'Chennai Super Kings', 'RCB': 'Royal Challengers Bengaluru',
  'KKR': 'Kolkata Knight Riders', 'SRH': 'Sunrisers Hyderabad', 'DC': 'Delhi Capitals',
  'PBKS': 'Punjab Kings', 'RR': 'Rajasthan Royals', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'
};

const getFull = (t) => {
  if (!t) return 'Unknown';
  const upper = t.toUpperCase();
  for (const [code, full] of Object.entries(TEAM_FULL_NAMES)) {
    if (code.toUpperCase() === upper || full.toUpperCase() === upper) return full;
  }
  return t;
};

// Reset stats
data.mostRuns = [];
data.fifties = [];
data.hundreds = [];
data.highestScores = [];
const seenFifties = new Set();
const seenCenturies = new Set();

(data.nextMatches || []).forEach(match => {
  if (match.status === 'completed' && match.scorecard) {
    ['innings1', 'innings2'].forEach(innType => {
      const innData = match.scorecard[innType];
      if (!innData?.batters) return;

      const innTeam = innData.team;
      const fullTeamName = getFull(innTeam);

      innData.batters.forEach((p) => {
        if (!p.name) return;
        const runs = parseInt(p.runs, 10) || 0;

        // Most Runs
        let runEntry = data.mostRuns.find(pr => pr.name.toUpperCase() === p.name.toUpperCase());
        if (!runEntry) {
          runEntry = { 
            name: p.name.toUpperCase(), 
            team: fullTeamName, 
            runs: 0, 
            matches: 0, 
            matchIds: [], 
            fifties: 0, 
            hundreds: 0,
            avg: '0.0',
            sr: '0.0'
          };
          data.mostRuns.push(runEntry);
        }
        runEntry.runs += runs;
        if (!runEntry.matchIds.includes(match.id)) {
            runEntry.matchIds.push(match.id);
        }
        runEntry.matches = runEntry.matchIds.length;
        runEntry.avg = (runEntry.runs / runEntry.matches).toFixed(1);
        runEntry.sr = p.sr || runEntry.sr || '0.0';

        // Milestones
        const key = `${match.id}-${innType}-${p.name.toUpperCase()}`;
        if (runs >= 50 && runs < 100 && !seenFifties.has(key)) {
          seenFifties.add(key);
          data.fifties.push({ matchId: match.id, name: p.name.toUpperCase(), team: fullTeamName, runs, balls: p.balls || 0, notOut: !!p.notOut });
          runEntry.fifties += 1;
        }
        if (runs >= 100 && !seenCenturies.has(key)) {
          seenCenturies.add(key);
          data.hundreds.push({ matchId: match.id, name: p.name.toUpperCase(), team: fullTeamName, runs, balls: p.balls || 0, notOut: !!p.notOut });
          runEntry.hundreds += 1;
        }

        // Highest Scores
        data.highestScores.push({ 
          matchId: match.id, 
          name: p.name.toUpperCase(), 
          team: fullTeamName, 
          runs, 
          balls: p.balls || 0, 
          notOut: !!p.notOut,
          innType
        });
      });
    });
  }
});

// Convert matchIds back to length if needed or just keep it
data.mostRuns.sort((a, b) => b.runs - a.runs);
data.highestScores.sort((a, b) => b.runs - a.runs || a.matchId - b.matchId);
data.highestScores = data.highestScores.slice(0, 6);

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Successfully rebuilt tournament stats with Highest Scores!');
