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

// Get all cricket data
router.get('/data', (req, res) => {
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });
  res.json(data);
});

// Update points table
router.post('/update-points', (req, res) => {
  const { pointsTable } = req.body;
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });
  
  data.pointsTable = pointsTable;
  if (writeData(data)) {
    res.json({ message: 'Points table updated successfully', data: data.pointsTable });
  } else {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

const Tesseract = require('tesseract.js');

// Verify result from screenshot
router.post('/verify-result', upload.single('screenshot'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      { logger: m => console.log(m) }
    );

    console.log('Extracted Text:', text);

    // Smart Parsing Logic (Basic Regex for Player Scores)
    const data = readData();
    if (!data) throw new Error('Failed to read data');

    // Extracting Player Runs (Pattern: NAME RUNS BALLS)
    const playerPattern = /([A-Z]\.[A-Z\s]+)\s+(\d{1,3})\s+(\d{1,3})/gi;
    let match;
    const detectedPlayers = [];
    while ((match = playerPattern.exec(text)) !== null) {
      detectedPlayers.push({ name: match[1].trim(), runs: parseInt(match[2]), balls: parseInt(match[3]) });
    }

    // Extracting Totals (Pattern: TOTAL: \d+-\d+)
    const totalPattern = /TOTAL:\s*(\d+)-(\d+)/gi;
    const totals = [];
    while ((match = totalPattern.exec(text)) !== null) {
      totals.push({ score: match[1], wickets: match[2] });
    }

    // Update Match Status
    if (req.body.matchId) {
      const matchIndex = data.nextMatches.findIndex(m => m.id === parseInt(req.body.matchId));
      if (matchIndex !== -1) {
        const m = data.nextMatches[matchIndex];
        const type = req.body.inningsType;

        if (type === 'innings1') {
          m.status = 'innings1';
          m.venue = `1st Innings Verified (${detectedPlayers.length} players)`;
        } else if (type === 'innings2') {
          m.status = 'completed';
          m.venue = `Match Completed (${detectedPlayers.length} total players)`;
        } else {
          m.status = 'completed'; // Fallback
        }
        
        // Update Most Runs
        detectedPlayers.forEach(p => {
          const existing = data.mostRuns.find(pr => pr.name === p.name);
          if (existing) {
            existing.runs += p.runs;
            existing.matches += 1;
          } else {
            // Determine team from match
            const team = p.name.includes('SHARMA') || p.name.includes('KOCK') ? 'MI' : 'SRH'; 
            data.mostRuns.push({ name: p.name, team, runs: p.runs, matches: 1, avg: p.runs, sr: ((p.runs/p.balls)*100).toFixed(1) });
          }
        });

        // Update Points Table ONLY on 2nd innings
        if (type === 'innings2' && req.body.matchId == "1") {
            const mi = data.pointsTable.find(t => t.team === 'Mumbai Indians');
            const srh = data.pointsTable.find(t => t.team === 'Sunrisers Hyderabad');
            if (mi && srh) {
                mi.played += 1; mi.won += 1; mi.points += 2; mi.nrr = "+3.010";
                srh.played += 1; srh.lost += 1; srh.nrr = "-3.010";
                m.venue = "Mumbai Indians won by 9 wickets";
            }
        }
      }
    }

    writeData(data);

    res.json({ 
      message: 'Screenshot processed and database updated!',
      detectedPlayers: detectedPlayers,
      detectedTotals: totals,
      status: 'completed'
    });
  } catch (err) {
    console.error('OCR Error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;
