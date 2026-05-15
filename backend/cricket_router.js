const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const DATA_FILE = path.join(__dirname, 'cricket_data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'cricket');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Helper to read data
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading cricket data:', err);
    return null;
  }
};

// Helper to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing cricket data:', err);
    return false;
  }
};

const TEAM_FULL_NAMES = {
  MI: 'Mumbai Indians',
  SRH: 'Sunrisers Hyderabad',
  KKR: 'Kolkata Knight Riders',
  DC: 'Delhi Capitals',
  PBKS: 'Punjab Kings',
  RR: 'Rajasthan Royals',
  GT: 'Gujarat Titans',
  LSG: 'Lucknow Super Giants'
};

function ensureCricketCollections(data) {
  if (!Array.isArray(data.mostRuns)) data.mostRuns = [];
  if (!Array.isArray(data.mostWickets)) data.mostWickets = [];
  if (!Array.isArray(data.fifties)) data.fifties = [];
  if (!Array.isArray(data.hundreds)) data.hundreds = [];
  if (!Array.isArray(data.centuries)) data.centuries = [];
  if (data.hundreds.length === 0 && data.centuries.length > 0) {
    data.hundreds = [...data.centuries];
  }
  if (data.centuries.length === 0 && data.hundreds.length > 0) {
    data.centuries = [...data.hundreds];
  }
}

function buildMilestonesFromBatters(batters = []) {
  const fifties = [];
  const hundreds = [];

  batters.forEach((player) => {
    const runs = parseInt(player.runs, 10) || 0;
    const balls = parseInt(player.balls, 10) || 0;

    if (runs >= 50 && runs < 100) {
      fifties.push({
        name: player.name,
        runs,
        balls
      });
    }

    if (runs >= 100) {
      hundreds.push({
        name: player.name,
        runs,
        balls
      });
    }
  });

  return { fifties, hundreds };
}

function normalizeManualInningsPayload(payload, fallbackTeam) {
  const batters = Array.isArray(payload?.batters) ? payload.batters.map((player) => {
    const runs = player?.runs ?? null;
    const balls = player?.balls ?? null;
    const safeRuns = (runs === null || runs === undefined) ? null : parseInt(runs, 10);
    const safeBalls = (balls === null || balls === undefined) ? null : parseInt(balls, 10);
    
    // Explicit check for didBat
    const didBat = player?.didBat !== undefined ? Boolean(player.didBat) : (safeRuns !== null);

    return {
      name: player?.name || 'Unknown',
      didBat: didBat,
      runs: safeRuns,
      balls: safeBalls,
      notOut: Boolean(player?.notOut),
      fours: player?.fours ?? 0,
      sixes: player?.sixes ?? 0,
      sr: (safeRuns !== null && safeBalls) ? ((safeRuns / safeBalls) * 100).toFixed(1) : (player?.sr ?? '0.0'),
      dismissal: player?.dismissal || null
    };
  }) : [];

  const autoMilestones = buildMilestonesFromBatters(batters);

  return {
    team: payload?.team || fallbackTeam,
    totalScore: String(payload?.totalScore || '0/0').replace('-', '/'),
    totalOvers: String(payload?.totalOvers || '0.0'),
    extras: parseInt(payload?.extras, 10) || 0,
    fifties: Array.isArray(payload?.fifties) ? payload.fifties : autoMilestones.fifties,
    hundreds: Array.isArray(payload?.hundreds) ? payload.hundreds : autoMilestones.hundreds,
    points: parseInt(payload?.points, 10) || 0,
    matchResult: payload?.matchResult || null,
    batters
  };
}

function rebuildTournamentStats(data) {
  if (!data) return;
  ensureCricketCollections(data);

  // 1. Reset all stats before recalculating from scratch
  data.pointsTable.forEach(row => {
    row.played = 0;
    row.won = 0;
    row.lost = 0;
    row.nr = 0;
    row.points = 0;
    row.nrr = "0.000";
  });
  data.mostRuns = [];
  data.mostWickets = [];
  data.fifties = [];
  data.hundreds = [];
  data.centuries = [];

  const seenFifties = new Set();
  const seenCenturies = new Set();
  const wicketCounts = {};

  const getFull = (t) => {
    if (!t) return 'Unknown';
    const upper = t.toUpperCase();
    for (const [code, full] of Object.entries(TEAM_FULL_NAMES)) {
      if (code.toUpperCase() === upper || full.toUpperCase() === upper) return full;
    }
    return t;
  };

  const parseOvers = (o) => {
    if (!o) return 20;
    const parts = String(o).split('.');
    const overs = parseFloat(parts[0]) || 0;
    const balls = parseFloat(parts[1]) || 0;
    return overs + (balls / 6);
  };

  const parseScore = (s) => {
    if (!s) return { runs: 0, wickets: 0 };
    const parts = String(s).split('/');
    return { runs: parseInt(parts[0]) || 0, wickets: parseInt(parts[1]) || 0 };
  };

  (data.nextMatches || []).forEach(match => {
    if (match.status === 'completed' && match.scorecard?.innings1 && match.scorecard?.innings2) {
      const i1 = match.scorecard.innings1;
      const i2 = match.scorecard.innings2;
      
      const s1 = parseScore(i1.totalScore);
      const s2 = parseScore(i2.totalScore);
      
      let winnerFull = null;
      let loserFull = null;
      let pointsToWinner = 2;

      // Result priority: explicit data in JSON
      if (i2.matchResult === 'won' || (i2.points && i2.points > 0)) {
        winnerFull = getFull(i2.team);
        loserFull = getFull(i1.team);
        pointsToWinner = parseInt(i2.points) || 2;
      } else if (i1.matchResult === 'won' || (i1.points && i1.points > 0)) {
        winnerFull = getFull(i1.team);
        loserFull = getFull(i2.team);
        pointsToWinner = parseInt(i1.points) || 2;
      } else {
        // Fallback to score
        if (s2.runs > s1.runs) {
          winnerFull = getFull(i2.team);
          loserFull = getFull(i1.team);
        } else {
          winnerFull = getFull(i1.team);
          loserFull = getFull(i2.team);
        }
      }

      if (winnerFull && loserFull) {
        const winnerRow = data.pointsTable.find(t => t.team.toLowerCase() === winnerFull.toLowerCase());
        const loserRow = data.pointsTable.find(t => t.team.toLowerCase() === loserFull.toLowerCase());

        if (winnerRow) { 
          winnerRow.played += 1; 
          winnerRow.won += 1; 
          winnerRow.points += pointsToWinner; 
        }
        if (loserRow) { 
          loserRow.played += 1; 
          loserRow.lost += 1; 
        }

        // NRR Calculation
        const i1Runs = s1.runs;
        const i2Runs = s2.runs;
        const i1Overs = parseOvers(i1.totalOvers) || 20;
        const i2Overs = parseOvers(i2.totalOvers) || 20;
        
        const t1NRR = (i1Runs / i1Overs) - (i2Runs / i2Overs);
        const t2NRR = (i2Runs / i2Overs) - (i1Runs / i1Overs);

        const t1Row = data.pointsTable.find(t => t.team.toLowerCase() === getFull(i1.team).toLowerCase());
        const t2Row = data.pointsTable.find(t => t.team.toLowerCase() === getFull(i2.team).toLowerCase());
        
        if (t1Row) t1Row.nrr = (parseFloat(t1Row.nrr) + t1NRR).toFixed(3);
        if (t2Row) t2Row.nrr = (parseFloat(t2Row.nrr) + t2NRR).toFixed(3);
      }
    }

    if (!match?.scorecard) return;

    ['innings1', 'innings2'].forEach(innType => {
      const innData = match.scorecard[innType];
      if (!innData?.batters) return;

      const innTeam = innData.team;
      const fullTeamName = getFull(innTeam);
      
      const opponentTeamCode = (innType === 'innings1') 
        ? (match.team2.toLowerCase() === innTeam.toLowerCase() ? match.team1 : match.team2)
        : (match.team1.toLowerCase() === innTeam.toLowerCase() ? match.team2 : match.team1);
      const bowlingTeamFull = getFull(opponentTeamCode);

      innData.batters.forEach((p) => {
        if (!p.name) return;
        const runs = parseInt(p.runs, 10) || 0;

        // Most Runs
        let runEntry = data.mostRuns.find(pr => pr.name.toUpperCase() === p.name.toUpperCase());
        if (!runEntry) {
          runEntry = { name: p.name.toUpperCase(), team: fullTeamName, runs: 0, matches: 0, matchIds: new Set() };
          data.mostRuns.push(runEntry);
        }
        runEntry.runs += runs;
        runEntry.matchIds.add(match.id);
        runEntry.matches = runEntry.matchIds.size;
        runEntry.avg = (runEntry.runs / runEntry.matches).toFixed(1);
        runEntry.sr = p.sr || runEntry.sr || '0.0';

        // Milestones
        const key = `${match.id}-${innType}-${p.name}`;
        if (runs >= 50 && runs < 100 && !seenFifties.has(key)) {
          seenFifties.add(key);
          data.fifties.push({ matchId: match.id, name: p.name, team: fullTeamName, runs, balls: p.balls || 0, notOut: !!p.notOut });
        }
        if (runs >= 100 && !seenCenturies.has(key)) {
          seenCenturies.add(key);
          data.hundreds.push({ matchId: match.id, name: p.name, team: fullTeamName, runs, balls: p.balls || 0, notOut: !!p.notOut });
        }

        // Wickets
        if (p.dismissal?.bowler) {
          const bowler = p.dismissal.bowler.toUpperCase();
          if (!wicketCounts[bowler]) {
            wicketCounts[bowler] = { name: bowler, team: bowlingTeamFull, wickets: 0, matchIds: new Set() };
          }
          wicketCounts[bowler].wickets += 1;
          wicketCounts[bowler].matchIds.add(match.id);
        }
      });
    });
  });

  for (const name in wicketCounts) {
    data.mostWickets.push({
      name: name,
      team: wicketCounts[name].team,
      wickets: wicketCounts[name].wickets,
      matches: wicketCounts[name].matchIds.size
    });
  }

  data.mostRuns.sort((a, b) => b.runs - a.runs);
  data.mostWickets.sort((a, b) => b.wickets - a.wickets);
  data.pointsTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return parseFloat(b.nrr) - parseFloat(a.nrr);
  });
  data.fifties.sort((a, b) => b.runs - a.runs || a.matchId - b.matchId);
  data.hundreds.sort((a, b) => b.runs - a.runs || a.matchId - b.matchId);
  data.centuries.sort((a, b) => b.runs - a.runs || a.matchId - b.matchId);
}

// Team rosters for validation
const TEAM_ROSTERS = {
  MI: ['Q.DE KOCK', 'R.SHARMA', 'T.VARMA', 'S.YADAV', 'H.PANDYA', 'S.RUTHERFORD', 'N.DHIR', 'M.SANTNER', 'T.BOULT', 'D.CHAHAR', 'J.BUMRAH'],
  SRH: ['A.SHARMA', 'T.HEAD', 'H.KLAASEN', 'I.KISHAN', 'H.PATEL', 'N.REDDY', 'L.LIVINGSTONE', 'S.ARORA', 'P.CUMMINS', 'S.MAVI', 'J.UNADKAT'],
  KKR: ['P.SALT', 'S.NARINE', 'A.RUSSELL', 'M.MOEEN', 'R.GURBAZ', 'A.SINGH', 'R.RAGHAV', 'V.IYER', 'H.RANA', 'S.FERGUSON', 'V.CHAKRAVARTHY'],
  DC: ['D.WARNER', 'P.SHAW', 'M.MARSH', 'T.STUBBS', 'A.NORTJE', 'K.RABADA', 'I.SHARMA', 'L.SIMONS', 'R.PANT', 'R.POWELL', 'K.MINHAS'],
  PBKS: ['S.DHAWAN', 'J.BAIRSTOW', 'L.LIVINGSTONE', 'H.GILL', 'S.CURRAN', 'A.BLUNDELL', 'H.MULLANPUR', 'A.TEWATIA', 'R.ASHWIN', 'A.MARKRAM', 'N.SAINI'],
  RR: ['J.BUTTLER', 'Y.JAISWAL', 'S.SAMSON', 'D.PADIKKAL', 'R.PARAG', 'J.ARCHER', 'T.BOULT', 'S.CHAHAL', 'S.HETMYER', 'K.KARTIKEYA', 'A.ZAMPA'],
  GT: ['S.GIL', 'W.SAHA', 'D.MILLER', 'V.SHANKAR', 'R.TEWATIA', 'M.SHAMI', 'A.JOSEPH', 'N.KHAN', 'O.KHAN', 'R.SAI', 'Y.DAYAL'],
  LSG: ['K.RAHUL', 'Q.DE KOCK', 'M.VOHRA', 'A.BADONI', 'D.STOINIS', 'A.GREEN', 'R.BISHNOI', 'M.PATHIRANA', 'S.THAKUR', 'N.LYON', 'Y.BISHNOI'],
};

// Get all cricket data
router.get('/data', (req, res) => {
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });
  ensureCricketCollections(data);
  res.json(data);
});

// Update points table
router.post('/update-points', (req, res) => {
  const { pointsTable } = req.body;
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });
  ensureCricketCollections(data);
  
  data.pointsTable = pointsTable;
  if (writeData(data)) {
    res.json({ message: 'Points table updated successfully', data: data.pointsTable });
  } else {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

function applyMatchOutcomeAndStats(dbData, match) {
  if (match.scorecard?.innings1 && !match.scorecard?.innings2) {
    match.status = 'innings1';
  }

  if (match.scorecard?.innings1 && match.scorecard?.innings2) {
    match.status = 'completed';
    const i1 = match.scorecard.innings1;
    const i2 = match.scorecard.innings2;

    let winnerTeamShort = null;
    let resultStr = '';

    // Check for explicit result in innings2 first (usually where result is known)
    if (i2.matchResult === 'won' || i2.points > 0) {
      winnerTeamShort = i2.team;
      resultStr = `${winnerTeamShort} won the match`;
    } else if (i1.matchResult === 'won' || i1.points > 0) {
      winnerTeamShort = i1.team;
      resultStr = `${winnerTeamShort} won the match`;
    } else {
      // Fallback to score calculation
      const result = determineWinner(match, i1, i2);
      if (result) {
        winnerTeamShort = result.winner;
        resultStr = result.result;
      }
    }

    if (winnerTeamShort) {
      match.venue = resultStr;
      match.winner = winnerTeamShort;

      const matchTeams = [match.team1, match.team2];
      const loserTeamShort = matchTeams.find(t => t.toLowerCase() === winnerTeamShort.toLowerCase() || TEAM_FULL_NAMES[t]?.toLowerCase() === winnerTeamShort.toLowerCase()) === match.team1 ? match.team2 : match.team1;
      
      const getFull = (t) => {
        if (!t) return 'Unknown';
        const upper = t.toUpperCase();
        for (const [code, full] of Object.entries(TEAM_FULL_NAMES)) {
          if (code.toUpperCase() === upper || full.toUpperCase() === upper) return full;
        }
        return t;
      };

      const winnerFull = getFull(winnerTeamShort);
      const winnerRow = dbData.pointsTable.find(t => t.team.toLowerCase() === winnerFull.toLowerCase());

      // Find loser
      const i1Full = getFull(i1.team);
      const i2Full = getFull(i2.team);
      const loserFull = (winnerFull.toLowerCase() === i1Full.toLowerCase()) ? i2Full : i1Full;
      const loserRow = dbData.pointsTable.find(t => t.team.toLowerCase() === loserFull.toLowerCase());

      const pointsToAdd = parseInt(i2.points || i1.points || 2);

      if (winnerRow) { 
        winnerRow.played += 1; 
        winnerRow.won += 1; 
        winnerRow.points += pointsToAdd; 
      }
      if (loserRow) { 
        loserRow.played += 1; 
        loserRow.lost += 1; 
      }

      // Update NRR using actual innings teams
      const parseOvers = (o) => {
        if (!o) return 20;
        const parts = String(o).split('.');
        const overs = parseFloat(parts[0]) || 0;
        const balls = parseFloat(parts[1]) || 0;
        return overs + (balls / 6);
      };

      const i1Runs = parseInt((i1.totalScore || '0').split('/')[0], 10) || 0;
      const i2Runs = parseInt((i2.totalScore || '0').split('/')[0], 10) || 0;
      const i1Overs = parseOvers(i1.totalOvers) || 20;
      const i2Overs = parseOvers(i2.totalOvers) || 20;
      
      const team1NRR = (i1Runs / i1Overs) - (i2Runs / i2Overs);
      const team2NRR = (i2Runs / i2Overs) - (i1Runs / i1Overs);

      const t1Row = dbData.pointsTable.find(t => t.team.toLowerCase() === i1Full.toLowerCase());
      const t2Row = dbData.pointsTable.find(t => t.team.toLowerCase() === i2Full.toLowerCase());
      
      if (t1Row) t1Row.nrr = (parseFloat(t1Row.nrr || 0) + team1NRR).toFixed(3);
      if (t2Row) t2Row.nrr = (parseFloat(t2Row.nrr || 0) + team2NRR).toFixed(3);
    }
  }

  rebuildTournamentStats(dbData);
}

router.post('/save-scorecard', (req, res) => {
  const { matchId, inningsType, inningsData } = req.body || {};
  const dbData = readData();
  if (!dbData) return res.status(500).json({ error: 'Failed to read data' });
  ensureCricketCollections(dbData);

  const parsedMatchId = parseInt(matchId, 10);
  if (!parsedMatchId || !inningsType || !inningsData) {
    return res.status(400).json({ error: 'matchId, inningsType and inningsData are required' });
  }

  if (!['innings1', 'innings2'].includes(inningsType)) {
    return res.status(400).json({ error: 'inningsType must be innings1 or innings2' });
  }

  const match = dbData.nextMatches.find(m => m.id === parsedMatchId);
  if (!match) {
    return res.status(404).json({ error: `Match ${parsedMatchId} not found` });
  }

  if (!match.originalVenue) {
    match.originalVenue = match.venue;
  }

  if (!match.scorecard) match.scorecard = {};
  match.scorecard[inningsType] = normalizeManualInningsPayload(
    inningsData,
    inningsType === 'innings1' ? match.team1 : match.team2
  );

  match.status = inningsType === 'innings1' ? 'innings1' : match.status;

  applyMatchOutcomeAndStats(dbData, match);

  if (!writeData(dbData)) {
    return res.status(500).json({ error: 'Failed to save scorecard' });
  }

  res.json({
    message: `${inningsType} scorecard saved successfully`,
    match
  });
});

const Tesseract = require('tesseract.js');

// ─── Smart OCR Parser ─────────────────────────────────────────────────────────
function parseScorecard(text, teamCode) {
  const debugPath = path.join(__dirname, 'ocr_debug.txt');
  fs.appendFileSync(debugPath, `\n\n--- ${new Date().toISOString()} (${teamCode}) ---\n${text}`);
  
  const batters = [];
  let totalScore = '0/0';
  let totalOvers = '0.0';
  let extras = 0;

  // 1. Better Team Detection
  let detectedTeam = teamCode;
  const upperText = text.toUpperCase();
  const teamKeys = Object.keys(TEAM_ROSTERS);
  for (const key of teamKeys) {
    if (upperText.includes(key) || (key === 'MI' && upperText.includes('MUMBAI')) || (key === 'SRH' && upperText.includes('SUNRISERS'))) {
      detectedTeam = key;
      break;
    }
  }

  // 2. Totals (Greedy)
  const totalMatch = text.match(/TOTAL[:\s]*(\d{1,3})[-\/](\d{1,2})/i);
  if (totalMatch) totalScore = `${totalMatch[1]}/${totalMatch[2]}`;

  const overMatch = text.match(/OVERS[:\s]*(\d{1,2}\.\d)/i);
  if (overMatch) totalOvers = overMatch[1];

  const lines = text.split('\n');
  const seenNames = new Set();
  const currentRoster = TEAM_ROSTERS[detectedTeam] || [];

  for (const rawLine of lines) {
    let line = rawLine.trim().toUpperCase();
    if (line.length < 5) continue;

    const nums = [...line.matchAll(/\b(\d{1,3})\b/g)].map(m => ({ val: parseInt(m[1]), idx: m.index }));
    if (nums.length < 2) continue;

    const balls = nums[nums.length - 1].val;
    const runs  = nums[nums.length - 2].val;
    const runsIdx = nums[nums.length - 2].idx;

    if (balls === 0 || balls > 250) continue;

    let namePart = line.substring(0, runsIdx).trim();
    
    // Capture dismissal info before cleaning name
    let dismissal = null;
    const cleanLine = line.replace(/[^A-Z\s\.]/g, ' ');
    const dMatch = cleanLine.match(/(?:C\s+([A-Z\.]+)\s+)?B\s+([A-Z\.]+)/i);
    if (dMatch) {
      dismissal = {
        fielder: dMatch[1] ? dMatch[1].trim() : null,
        bowler: dMatch[2].trim()
      };
    } else if (cleanLine.includes(' RUN OUT ')) {
      dismissal = { fielder: 'RO', bowler: 'RUN OUT' };
    } else if (cleanLine.includes(' LBW ')) {
      const lbwMatch = cleanLine.match(/LBW\s+B\s+([A-Z\.]+)/i);
      dismissal = { fielder: null, bowler: lbwMatch ? lbwMatch[1].trim() : 'Unknown' };
    }

    namePart = namePart.split(/NOT OUT|NOT| CAUGHT| C | B | LBW| RUN OUT/)[0].trim();
    
    // Clean up name from garbage characters
    const cleanName = namePart.replace(/[^A-Z\.]/g, '');
    if (cleanName.length < 3) continue;

    // Fuzzy Match with Roster
    let finalName = cleanName;
    for (const rPlayer of currentRoster) {
      const rP = rPlayer.toUpperCase();
      if (cleanName.includes(rP.split('.').pop()) || rP.includes(cleanName.slice(-4))) {
        finalName = rPlayer;
        break;
      }
    }

    if (/EXTRAS|TOTAL|OVERS|SCORE/.test(finalName)) continue;
    if (seenNames.has(finalName)) continue;

    seenNames.add(finalName);
    batters.push({ 
      name: finalName, 
      runs, 
      balls, 
      fours: 0, 
      sixes: 0, 
      sr: ((runs / balls) * 100).toFixed(1),
      notOut: line.includes('NOT OUT'),
      dismissal
    });
  }

  batters.sort((a, b) => b.runs - a.runs);
  return { batters, totalScore, totalOvers, extras, detectedTeam };
}

function validateParsedInnings(parsed) {
  const totalRuns = parseInt(String(parsed.totalScore || '0').split('/')[0], 10) || 0;
  const batterRuns = (parsed.batters || []).reduce((sum, batter) => sum + (parseInt(batter.runs, 10) || 0), 0);
  const batterCount = parsed.batters?.length || 0;

  if (batterCount < 5) {
    return {
      ok: false,
      reason: `OCR only found ${batterCount} batter rows, so this screenshot is not reliable enough.`
    };
  }

  if (totalRuns >= 50 && batterRuns < Math.max(40, Math.floor(totalRuns * 0.55))) {
    return {
      ok: false,
      reason: `OCR found only ${batterRuns} batting runs against total ${totalRuns}, so the screenshot is mixing bowling data and cannot be trusted.`
    };
  }

  return { ok: true };
}

// ─── Determine winner ─────────────────────────────────────────────────────────
function determineWinner(match, innings1Data, innings2Data) {
  if (!innings1Data?.totalScore || !innings2Data?.totalScore) return null;

  const parseScore = (s) => {
    if (!s) return { runs: 0, wickets: 0 };
    const parts = s.split('/');
    return { runs: parseInt(parts[0]) || 0, wickets: parseInt(parts[1]) || 0 };
  };

  const score1 = parseScore(innings1Data.totalScore);
  const score2 = parseScore(innings2Data.totalScore);
  
  const team1 = innings1Data.team || match.team1;
  const team2 = innings2Data.team || match.team2;

  if (score2.runs > score1.runs) {
    // Chasing team won
    const wicketsLeft = 10 - score2.wickets;
    return {
      winner: team2,
      result: `${team2} won by ${wicketsLeft} wickets`
    };
  } else {
    // Defending team won
    const runsMargin = score1.runs - score2.runs;
    return {
      winner: team1,
      result: `${team1} won by ${runsMargin} runs`
    };
  }
}

// ─── Verify result from screenshot ───────────────────────────────────────────
router.post('/verify-result', upload.single('screenshot'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      { logger: m => process.stdout.write('.') }
    );

    const dbData = readData();
    if (!dbData) throw new Error('Failed to read data');
    ensureCricketCollections(dbData);

    const matchId = parseInt(req.body.matchId);
    const inningsType = req.body.inningsType; // 'innings1' or 'innings2'

    if (!matchId || !inningsType) {
      return res.status(400).json({ error: 'matchId and inningsType are required' });
    }

    const matchIndex = dbData.nextMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) {
      return res.status(404).json({ error: `Match ${matchId} not found` });
    }

    const match = dbData.nextMatches[matchIndex];

    // Capture original venue if not already captured
    if (!match.originalVenue) {
      match.originalVenue = match.venue;
    }

    // Parse the image first to detect team and batters
    const parsed = parseScorecard(text, inningsType === 'innings1' ? match.team1 : match.team2);
    const validation = validateParsedInnings(parsed);

    if (!validation.ok) {
      return res.status(422).json({
        error: `${validation.reason} Please upload a clearer batting scorecard screenshot.`
      });
    }

    // Use detected team from image, or fallback to the one expected by the button
    const battingTeam = parsed.detectedTeam || (inningsType === 'innings1' ? match.team1 : match.team2);

    // Store innings data inside the match object
    if (!match.scorecard) match.scorecard = {};
    match.scorecard[inningsType] = normalizeManualInningsPayload({
      team: battingTeam,
      totalScore: parsed.totalScore,
      totalOvers: parsed.totalOvers,
      extras: parsed.extras,
      batters: parsed.batters
    }, battingTeam);

    // Update match status
    if (inningsType === 'innings1') {
      match.status = 'innings1';
    } else if (inningsType === 'innings2') {
      match.status = 'completed';
    }

    applyMatchOutcomeAndStats(dbData, match);

    writeData(dbData);

    res.json({
      message: inningsType === 'innings1'
        ? `✅ 1st Innings uploaded! ${parsed.batters.length} batters found for ${battingTeam}.`
        : `🏆 Match Complete! ${parsed.batters.length} batters for ${battingTeam}.`,
      detectedPlayers: parsed.batters,
      totalScore: parsed.totalScore,
      totalOvers: parsed.totalOvers,
      status: match.status,
      innings: inningsType,
    });

  } catch (err) {
    console.error('OCR Error:', err);
    res.status(500).json({ error: 'Failed to process image: ' + err.message });
  }
});

// ─── Delete / Reset a match's scorecard data ──────────────────────────────────
router.delete('/match/:id', (req, res) => {
  const matchId = parseInt(req.params.id);
  const dbData = readData();
  if (!dbData) return res.status(500).json({ error: 'Failed to read data' });

  const matchIndex = dbData.nextMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return res.status(404).json({ error: `Match ${matchId} not found` });

  const match = dbData.nextMatches[matchIndex];
  const prevStatus = match.status;

  // Revert points table if match was completed
  if (prevStatus === 'completed' && match.winner) {
    const winnerFull = TEAM_FULL_NAMES[match.winner];
    const loserShort = match.winner === match.team1 ? match.team2 : match.team1;
    const loserFull  = TEAM_FULL_NAMES[loserShort];

    const winnerRow = dbData.pointsTable.find(t => t.team === winnerFull);
    const loserRow  = dbData.pointsTable.find(t => t.team === loserFull);
    if (winnerRow) { winnerRow.played = Math.max(0, winnerRow.played - 1); winnerRow.won = Math.max(0, winnerRow.won - 1); winnerRow.points = Math.max(0, winnerRow.points - 2); }
    if (loserRow)  { loserRow.played  = Math.max(0, loserRow.played  - 1); loserRow.lost  = Math.max(0, loserRow.lost  - 1); }
  }

  // Reset match to original pending state
  const originalVenue = match.originalVenue || match.venue;
  match.status   = 'pending';
  match.scorecard = undefined;
  match.winner   = undefined;
  match.venue    = originalVenue;
  // Keep originalVenue for future resets

  rebuildTournamentStats(dbData);

  writeData(dbData);
  res.json({ message: `Match ${matchId} data deleted and reset to pending.` });
});

module.exports = router;
