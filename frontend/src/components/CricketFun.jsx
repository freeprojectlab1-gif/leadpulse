import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Award,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  BarChart3,
  Zap,
  UploadCloud,
  Trash2,
  Star,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Badge, 
  Input, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Progress,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui';

const IPL_TEAMS = [
  { id: 'MI', name: 'Mumbai Indians', short: 'MI', color: '#004BA0', logo: '🌪️' },
  { id: 'KKR', name: 'Kolkata Knight Riders', short: 'KKR', color: '#3A225D', logo: '⚔️' },
  { id: 'DC', name: 'Delhi Capitals', short: 'DC', color: '#000080', logo: '🐯' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#FF822A', logo: '🦅' },
  { id: 'PBKS', name: 'Punjab Kings', short: 'PBKS', color: '#ED1B24', logo: '🦁' },
  { id: 'RR', name: 'Rajasthan Royals', short: 'RR', color: '#EA1A85', logo: '🐘' },
  { id: 'GT', name: 'Gujarat Titans', short: 'GT', color: '#1B2133', logo: '⚡' },
  { id: 'LSG', name: 'Lucknow Super Giants', short: 'LSG', color: '#0057E2', logo: '🔥' },
];

const CricketFun = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [pointsTable, setPointsTable] = useState([]);
  const [mostRuns, setMostRuns] = useState([]);
  const [mostWickets, setMostWickets] = useState([]);
  const [highestScores, setHighestScores] = useState([]);
  const [nextMatches, setNextMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);
  const [ssFile, setSsFile] = useState(null);
  const [viewingMatch, setViewingMatch] = useState(null);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualInputMatch, setManualInputMatch] = useState(null);
  const [manualInputType, setManualInputType] = useState('innings1');
  const [manualScoreText, setManualScoreText] = useState('');
  const [savingManualScore, setSavingManualScore] = useState(false);
  const [activeInningsTab, setActiveInningsTab] = useState('innings1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/cricket/data');
        const sortedPoints = (res.data.pointsTable || []).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return parseFloat(b.nrr) - parseFloat(a.nrr);
        });
        setPointsTable(sortedPoints);
        setMostRuns(res.data.mostRuns);
        setMostWickets(res.data.mostWickets);
        setHighestScores(res.data.highestScores || []);
        setNextMatches(res.data.nextMatches);
      } catch (err) {
        console.error('Error fetching cricket data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshCricketData = async (matchId = null) => {
    const refreshRes = await axios.get('/api/cricket/data');
    const sortedPoints = (refreshRes.data.pointsTable || []).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return parseFloat(b.nrr) - parseFloat(a.nrr);
    });
    setPointsTable(sortedPoints);
    setMostRuns(refreshRes.data.mostRuns);
    setMostWickets(refreshRes.data.mostWickets);
    setHighestScores(refreshRes.data.highestScores || []);
    setNextMatches(refreshRes.data.nextMatches);
    if (matchId) {
      const freshMatch = refreshRes.data.nextMatches.find(m => m.id === matchId);
      if (freshMatch) setViewingMatch(freshMatch);
    }
  };

  const handleFileUpload = async (directFile, matchId, type) => {
    const targetFile = directFile || ssFile;
    if (!targetFile) return;
    setVerifying(true);
    const formData = new FormData();
    formData.append('screenshot', targetFile);
    if (matchId) formData.append('matchId', matchId);
    if (type) formData.append('inningsType', type);

    try {
      const res = await axios.post('/api/cricket/verify-result', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (type === 'innings1') {
        alert('✅ 1st Innings Verified! \nAb please 2nd Innings ka screenshot upload karein.');
      } else if (type === 'innings2') {
        alert('🏆 Match Finished! \nSaara data database mein save ho gaya hai.');
      } else {
        alert('Verification Success: ' + res.data.message);
      }
      
      // Re-fetch data to update UI
      await refreshCricketData(matchId);

    } catch (err) {
      console.error('Error verifying result:', err);
      alert(err.response?.data?.error || 'Failed to verify result');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteMatch = async (matchId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Match ${matchId} ka saara data delete karna chahte ho? (Points table bhi revert ho jaega)`)) return;
    try {
      await axios.delete(`/api/cricket/match/${matchId}`);
      await refreshCricketData();
      if (viewingMatch?.id === matchId) setViewingMatch(null);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const openManualInputDialog = (match, inningsType = 'innings1') => {
    setManualInputMatch(match);
    setManualInputType(inningsType);
    setManualScoreText(`{\n  "team": "",\n  "totalScore": "",\n  "totalOvers": "",\n  "extras": 0,\n  "fifties": [],\n  "hundreds": [],\n  "batters": []\n}`);
    setManualInputOpen(true);
  };

  const handleManualScoreSave = async () => {
    if (!manualInputMatch) return;

    try {
      setSavingManualScore(true);
      const inningsData = JSON.parse(manualScoreText);

      await axios.post('/api/cricket/save-scorecard', {
        matchId: manualInputMatch.id,
        inningsType: manualInputType,
        inningsData
      });

      await refreshCricketData(manualInputMatch.id);
      setManualInputOpen(false);
      setManualScoreText('');
      alert(`${manualInputType} data saved successfully`);
    } catch (err) {
      console.error('Error saving manual score:', err);
      if (err instanceof SyntaxError) {
        alert('JSON format invalid hai. Please valid JSON paste karo.');
      } else {
        alert(err.response?.data?.error || 'Manual score save failed');
      }
    } finally {
      setSavingManualScore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTeamLogo = (teamName, sizeClass = "w-12 h-12") => {
    if (!teamName) return '🏏';
    const urls = {
      'MI': '/logos/mi.png',
      'KKR': '/logos/kkr.png',
      'DC': '/logos/dc.png',
      'SRH': '/logos/srh.png',
      'PBKS': '/logos/Punjab_Kings_Logo.svg.png',
      'RR': '/logos/rajasthan-royals-logo-rr-logo-icon-on-transparent-background-free-png.webp',
      'GT': '/logos/gujarat-titans-logo-gt-logo-icon-on-transparent-background-free-png.webp',
      'LSG': '/logos/Lucknow-Super-Giants-Logo.png'
    };
    
    const searchName = String(teamName).toUpperCase();
    const team = IPL_TEAMS.find(t => t.name.toUpperCase() === searchName || t.short.toUpperCase() === searchName);
    const shortName = team ? team.short : teamName;
    
    if (urls[shortName]) {
      return (
        <div className={`${sizeClass} flex items-center justify-center p-1 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/40 overflow-hidden group`}>
          <img 
            src={urls[shortName]} 
            alt={shortName} 
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500 ease-out" 
          />
        </div>
      );
    }
    return team ? <span className="drop-shadow-lg text-4xl">{team.logo}</span> : '🏏';
  };

  const getTeamColor = (teamName) => {
    const team = IPL_TEAMS.find(t => t.name === teamName || t.short === teamName);
    return team ? team.color : 'var(--primary)';
  };

  if (viewingMatch) {
    const innings1 = viewingMatch.scorecard?.innings1;
    const innings2 = viewingMatch.scorecard?.innings2;
    
    const activeInningsData = activeInningsTab === 'innings1' ? innings1 : innings2;
    
    const getTeamShort = (teamName) => {
      const team = IPL_TEAMS.find(t => t.name === teamName || t.short === teamName);
      return team ? team.short : teamName;
    };

    const team1Name = innings1?.team ? getTeamShort(innings1.team) : viewingMatch.team1;
    const team2Name = innings2?.team ? getTeamShort(innings2.team) : viewingMatch.team2;
    
    const activeTeam = activeInningsTab === 'innings1' ? team1Name : team2Name;
    
    const displayBatters = activeInningsData?.batters || [];
    const displayTotal = activeInningsData?.totalScore || 'Pending';
    const displayOvers = activeInningsData?.totalOvers || null;
    const displayExtras = activeInningsData?.extras ?? 0;

    return (
      <div className="px-4 md:px-6 pb-16 pt-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button variant="ghost" className="w-fit gap-2 rounded-2xl hover:bg-muted/50" onClick={() => setViewingMatch(null)}>
            <ChevronRight size={18} className="rotate-180" /> Back
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            {viewingMatch.status === 'pending' && (
              <Button
                variant="outline"
                className="rounded-2xl border-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary"
                onClick={() => openManualInputDialog(viewingMatch, 'innings1')}
              >
                Input 1st Innings
              </Button>
            )}
            {viewingMatch.status === 'innings1' && (
              <Button
                variant="outline"
                className="rounded-2xl border-orange-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-500"
                onClick={() => openManualInputDialog(viewingMatch, 'innings2')}
              >
                Input 2nd Innings
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteMatch(viewingMatch.id, e)} title="Match data delete karo">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.75fr)_420px]">
          <div className="space-y-6">
            <Card className="overflow-hidden border border-border/40 bg-[#0d121d] shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center justify-center border-b border-border/40 px-4 py-4 text-[10px] md:text-sm font-bold text-muted-foreground">
                  <Calendar size={15} className="mr-2" /> Match {viewingMatch.id} • {viewingMatch.time}
                </div>
                <div className="grid grid-cols-3 items-center px-4 py-6 md:px-8 md:py-8">
                  <div className="text-center">
                    <div className="text-xl md:text-3xl font-black text-white">{innings1?.team || viewingMatch.team1}</div>
                    <div className="mt-1 text-[10px] md:text-base font-bold text-slate-400">First Innings</div>
                  </div>
                  <div className="flex justify-center text-slate-600 font-black text-sm md:text-xl">VS</div>
                  <div className="text-center">
                    <div className="text-xl md:text-3xl font-black text-white">{(innings1?.team || viewingMatch.team1) === viewingMatch.team1 ? viewingMatch.team2 : viewingMatch.team1}</div>
                    <div className="mt-1 text-[10px] md:text-base font-bold text-slate-400">Chasing</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2 md:gap-4 rounded-[1.25rem] md:rounded-[1.75rem] bg-[#111827] p-2 md:p-3">
              <button 
                onClick={() => setActiveInningsTab('innings1')}
                className={`rounded-[0.75rem] md:rounded-[1rem] px-4 py-2 md:px-6 md:py-3 text-center text-sm md:text-xl font-black transition-all ${activeInningsTab === 'innings1' ? 'bg-[#0b111a] text-white shadow-lg shadow-black/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {team1Name}
              </button>
              <button 
                onClick={() => setActiveInningsTab('innings2')}
                className={`rounded-[0.75rem] md:rounded-[1rem] px-4 py-2 md:px-6 md:py-3 text-center text-sm md:text-xl font-black transition-all ${activeInningsTab === 'innings2' ? 'bg-[#0b111a] text-white shadow-lg shadow-black/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {team2Name}
              </button>
            </div>

            <Card className="overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-blue-500/40 bg-[#0d121d] shadow-2xl">
              <CardHeader className="border-b border-border/30 px-4 py-4 md:px-5 md:py-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-[2rem] font-black uppercase tracking-tight text-white">
                  <Zap className="text-orange-500 h-5 w-5 md:h-6 md:w-6" /> BATTING—{activeTeam}
                </CardTitle>
                <div className="mt-1 text-xs md:text-[1.2rem] font-black uppercase tracking-tight text-slate-400">
                  {activeInningsTab === 'innings1' ? '1st Innings' : '2nd Innings'}
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px] md:min-w-0">
                  <thead>
                    <tr className="bg-[#111827] text-left text-xs font-black uppercase text-slate-400">
                      <th className="px-5 py-5">BATTER</th>
                      <th className="px-5 py-5">STATUS</th>
                      <th className="px-5 py-5 text-center">R</th>
                      <th className="px-5 py-5 text-center">B</th>
                      <th className="px-5 py-5 text-center">4S</th>
                      <th className="px-5 py-5 text-center">6S</th>
                      <th className="px-5 py-5 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBatters.length > 0 ? displayBatters.map((player, index) => (
                      <tr key={index} className="border-t border-white/5 text-white hover:bg-white/[0.03] transition-colors duration-300">
                        <td className="px-5 py-6 text-[1rem] font-black uppercase">{player.name}</td>
                        <td className="px-5 py-6 text-[0.85rem] font-medium text-slate-400">
                          {player.didBat === false ? (
                            <span className="text-slate-500 font-bold">DNB</span>
                          ) : player.notOut ? (
                            <span className="text-emerald-500 font-bold">NOT OUT</span>
                          ) : player.dismissal ? (
                            <span>
                              {player.dismissal.fielder ? `c ${player.dismissal.fielder} ` : ''}
                              b {player.dismissal.bowler}
                            </span>
                          ) : (
                            'out'
                          )}
                        </td>
                        <td className="px-5 py-6 text-center text-[1rem] font-black">{player.didBat === false ? '-' : player.runs}</td>
                        <td className="px-5 py-6 text-center text-[1rem] font-medium text-slate-300">{player.didBat === false ? '-' : player.balls}</td>
                        <td className="px-5 py-6 text-center text-[1rem] font-medium">{player.didBat === false ? '-' : (player.fours ?? 0)}</td>
                        <td className="px-5 py-6 text-center text-[1rem] font-medium">{player.didBat === false ? '-' : (player.sixes ?? 0)}</td>
                        <td className="px-5 py-6 text-right font-mono text-[1rem] font-black text-blue-400">{player.didBat === false ? '-' : (player.sr || '-')}</td>
                      </tr>
                    )) : (
                      <tr className="border-t border-white/5 text-white hover:bg-white/[0.03] transition-colors duration-300">
                        <td colSpan={7} className="px-5 py-16 text-center text-lg font-bold text-slate-400">No Data Available for {activeInningsTab === 'innings1' ? '1st' : '2nd'} Innings</td>
                      </tr>
                    )}
                    <tr className="border-t border-white/5 text-white hover:bg-white/[0.03] transition-colors duration-300">
                      <td colSpan={7} className="px-5 py-5 text-lg font-bold text-slate-400">Extras: <span className="font-black text-white">{displayExtras}</span></td>
                    </tr>
                    <tr className="border-t border-border/20 bg-[#111827] text-white">
                      <td colSpan={2} className="px-5 py-5 text-[1.15rem] font-black">TOTAL</td>
                      <td colSpan={5} className="px-5 py-5 text-right text-[1.15rem] font-black text-blue-400">
                        {displayTotal}{displayOvers ? ` (${displayOvers} Ov)` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.5rem] md:rounded-[2rem] border border-border/40 bg-[#0d121d] shadow-xl">
              <CardHeader className="px-5 md:px-7 pt-6 md:pt-8">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.18em] text-blue-400">
                  <Award size={16} className="md:w-[18px] md:h-[18px]" /> PLAYER OF THE MATCH
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center px-4 md:px-6 pb-8 md:pb-10 pt-6 md:pt-8 text-center">
                {(() => {
                  const allBatters = [...(innings1?.batters || []), ...(innings2?.batters || [])];
                  const mvp = allBatters.length > 0 ? allBatters.reduce((prev, current) => (parseInt(current.runs || 0) > parseInt(prev.runs || 0) ? current : prev)) : null;
                  
                  if (!mvp || viewingMatch.status !== 'completed') {
                    return (
                      <>
                        <div className="flex h-20 w-20 md:h-28 md:w-28 items-center justify-center rounded-full bg-slate-800 text-2xl md:text-4xl font-black text-slate-600 border-2 border-slate-700">?</div>
                        <div className="mt-4 md:mt-6 text-xl md:text-2xl font-black text-slate-500">TBA</div>
                        <div className="mt-1 text-[10px] md:text-sm font-bold uppercase text-slate-600 italic">Match in Progress</div>
                      </>
                    );
                  }

                  const mvpTeam = (innings1?.batters || []).includes(mvp) ? (innings1?.team || viewingMatch.team1) : (innings2?.team || viewingMatch.team2);
                  const initials = mvp.name.split(' ').map(n => n[0]).join('').substring(0, 2);

                  return (
                    <>
                      <Avatar className="mb-4 md:mb-6 h-20 w-20 md:h-28 md:w-28 border-2 border-blue-400/70 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <AvatarFallback className="bg-blue-500 text-2xl md:text-4xl font-black text-white">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-lg md:text-2xl font-black text-white uppercase truncate max-w-full">{mvp.name}</div>
                      <div className="mt-1 text-sm md:text-lg font-black uppercase text-slate-400">{getTeamShort(mvpTeam)}</div>
                      <Badge className="mt-4 md:mt-5 rounded-full bg-blue-500 px-6 md:px-8 py-1.5 md:py-2 text-base md:text-lg font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30">
                        {mvp.runs} ({mvp.balls})
                      </Badge>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] md:rounded-[2rem] border border-border/40 bg-[#0d121d] shadow-xl">
              <CardHeader className="px-5 md:px-7 pt-6 md:pt-8">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.18em] text-white">
                  <BarChart3 size={16} className="md:w-[18px] md:h-[18px]" /> MATCH INFO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 md:space-y-8 px-5 md:px-7 pb-8 md:pb-10 pt-4 md:pt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs md:text-lg font-black uppercase text-slate-500">STATUS</span>
                  <span className={`text-right text-xs md:text-lg font-black ${viewingMatch.status === 'completed' ? 'text-emerald-500' : 'text-white'}`}>
                    {viewingMatch.status === 'completed' ? 'COMPLETED' : viewingMatch.status === 'innings1' ? '1st Innings Over' : 'PENDING'}
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-xs md:text-lg font-black uppercase text-slate-500">{viewingMatch.status === 'completed' ? 'RESULT' : 'TOSS / INFO'}</span>
                  <span className="text-left text-sm md:text-lg font-black text-white leading-tight">
                    {viewingMatch.venue}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs md:text-lg font-black uppercase text-slate-500">SERIES</span>
                  <span className="text-right text-xs md:text-lg font-black text-white">IPL Season 1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={manualInputOpen} onOpenChange={setManualInputOpen}>
          <DialogContent className="max-w-3xl border-border/50 bg-[#0d121d] text-white w-[95vw] rounded-2xl md:rounded-3xl p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-black">
                {manualInputMatch ? `Match ${manualInputMatch.id} - ${manualInputType}` : 'Manual Input'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-xs md:text-sm text-slate-400 italic">
                JSON format mein scorecard paste karein.
              </p>
              <textarea
                value={manualScoreText}
                onChange={(e) => setManualScoreText(e.target.value)}
                className="min-h-[300px] md:min-h-[420px] w-full rounded-xl md:rounded-2xl border border-border/40 bg-[#111827] p-3 md:p-4 font-mono text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-colors"
                placeholder='{"team":"","totalScore":"","totalOvers":"","extras":0,"fifties":[],"hundreds":[],"batters":[]}'
              />
              <div className="flex justify-end gap-2 md:gap-3">
                <Button variant="outline" className="rounded-xl md:rounded-2xl text-xs" onClick={() => setManualInputOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-xl md:rounded-2xl text-xs bg-primary hover:bg-primary/80" onClick={handleManualScoreSave} disabled={savingManualScore}>
                  {savingManualScore ? 'Saving...' : 'Save Scorecard'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (false && viewingMatch) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2 rounded-2xl hover:bg-muted/50"
            onClick={() => setViewingMatch(null)}
          >
            <ChevronRight size={20} className="rotate-180" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            {/* Upload buttons inside detail view */}
            {viewingMatch.status === 'pending' && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/*"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], viewingMatch.id, 'innings1'); }}
                />
                <span className={`inline-flex items-center gap-2 rounded-2xl border border-primary/20 text-primary hover:bg-primary/10 font-bold px-4 py-2 text-xs cursor-pointer bg-background uppercase tracking-widest ${verifying ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud size={14} /> {verifying ? 'Processing...' : '1st Innings SS'}
                </span>
              </label>
            )}
            {viewingMatch.status === 'innings1' && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/*"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], viewingMatch.id, 'innings2'); }}
                />
                <span className={`inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-bold px-4 py-2 text-xs cursor-pointer bg-background uppercase tracking-widest ${verifying ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud size={14} /> {verifying ? 'Processing...' : '2nd Innings SS'}
                </span>
              </label>
            )}
            {viewingMatch.status === 'completed' && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-xl font-black text-[10px] px-4 py-2">
                ✅ MATCH COMPLETED
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">
              IPL 2024 • MATCH {viewingMatch.id}
            </Badge>
          </div>
        </div>

        {/* Hero Score Section */}
        <Card className="premium-card relative overflow-hidden border-none bg-gradient-to-br from-muted/30 to-background shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy size={200} />
          </div>
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex flex-col items-center gap-6 group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-background border-4 border-primary/10 flex items-center justify-center text-7xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  {getTeamLogo(viewingMatch.team1)}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{viewingMatch.team1}</h2>
                  <p className="text-muted-foreground font-bold">First Innings</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="px-6 py-2 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">VS</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-2 leading-tight">
                    {viewingMatch.status === 'completed' ? viewingMatch.venue : 'Match Pending'}
                  </div>
                  <div className="flex items-center gap-2 justify-center text-muted-foreground font-medium">
                    <Calendar size={16} /> {viewingMatch.date} • {viewingMatch.time}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-background border-4 border-primary/10 flex items-center justify-center text-7xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  {getTeamLogo(viewingMatch.team2)}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{viewingMatch.team2}</h2>
                  <p className="text-muted-foreground font-bold">Chasing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scorecard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="innings1">
              <TabsList className="w-full bg-muted/30 p-1 rounded-2xl h-14">
                <TabsTrigger value="innings1" className="flex-1 rounded-xl font-black text-sm">{viewingMatch.team1}</TabsTrigger>
                <TabsTrigger value="innings2" className="flex-1 rounded-xl font-black text-sm">{viewingMatch.team2}</TabsTrigger>
              </TabsList>

              {['innings1', 'innings2'].map((inn, innIdx) => {
                const innData = viewingMatch.scorecard?.[inn];
                const teamCode = inn === 'innings1' ? viewingMatch.team1 : viewingMatch.team2;
                const batters = innData?.batters || [];
                const total = innData?.totalScore || null;
                const overs = innData?.totalOvers || null;
                const extras = innData?.extras ?? null;

                return (
                  <TabsContent key={inn} value={inn} className="mt-6 space-y-6">
                    <Card className="premium-card border-border/40">
                      <CardHeader className="pb-4 border-b border-border/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-black flex items-center gap-2 uppercase">
                            <Zap className="text-orange-500" /> Batting — {teamCode}
                          </CardTitle>
                          {batters.length === 0 && (
                            <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                              {viewingMatch.status === 'pending' ? 'Upload Screenshot' : innIdx === 0 && viewingMatch.status === 'innings1' ? 'Awaiting 2nd Innings' : 'No Data'}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-[10px] font-black text-muted-foreground uppercase bg-muted/30">
                              <th className="p-4">Batter</th>
                              <th className="p-4 text-center">R</th>
                              <th className="p-4 text-center">B</th>
                              <th className="p-4 text-center">4s</th>
                              <th className="p-4 text-center">6s</th>
                              <th className="p-4 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {batters.length > 0 ? batters.map((p, i) => (
                              <tr key={i} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4 font-bold capitalize">{p.name}</td>
                                <td className="p-4 text-center font-black text-base">{p.runs}</td>
                                <td className="p-4 text-center text-muted-foreground">{p.balls}</td>
                                <td className="p-4 text-center">{p.fours ?? '-'}</td>
                                <td className="p-4 text-center">{p.sixes ?? '-'}</td>
                                <td className="p-4 text-right font-mono text-primary font-bold">{p.sr}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold italic">
                                  No Data Available
                                </td>
                              </tr>
                            )}
                            {extras !== null && batters.length > 0 && (
                              <tr className="bg-muted/10">
                                <td className="p-4 font-bold text-muted-foreground text-sm" colSpan={6}>
                                  Extras: <span className="font-black text-foreground">{extras}</span>
                                </td>
                              </tr>
                            )}
                            <tr className="bg-primary/5">
                              <td className="p-4 font-black text-lg">TOTAL</td>
                              <td colSpan={5} className="p-4 text-right font-black text-primary text-xl">
                                {total ? `${total}${overs ? ` (${overs})` : ''}` : 'Pending'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          {/* Side Panels */}
          <div className="space-y-8">
            <Card className="premium-card border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Award size={18} /> Player of the Match
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                 <Avatar className="h-24 w-24 border-4 border-primary shadow-xl mb-4">
                   <AvatarFallback className="bg-primary text-white text-3xl font-black">RS</AvatarFallback>
                 </Avatar>
                 <div className="text-xl font-black">R. Sharma</div>
                 <div className="text-xs font-bold text-muted-foreground uppercase mb-4">Mumbai Indians</div>
                 <Badge className="rounded-full px-6 py-1 font-black bg-primary text-white">85 (36)</Badge>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/40">
               <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={18} /> Match Info
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Toss</span>
                    <span className="text-xs font-black">MI won and chose to Bat</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Venue</span>
                    <span className="text-xs font-black">LeadPulse Arena</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Series</span>
                    <span className="text-xs font-black">IPL Season 1</span>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 px-2 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
            <Trophy size={18} className="md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-lg md:text-3xl font-black tracking-tight text-foreground leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">Cricket Fun</span> 
              <span className="text-primary text-[10px] md:text-2xl ml-1.5">IPL 2024</span>
            </h1>
            <p className="text-muted-foreground text-[9px] md:text-sm font-medium">Real-time match tracking & stats.</p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none gap-2 h-9 md:h-12 rounded-xl px-2 md:px-6 font-bold text-[10px] md:text-sm border-white/10 bg-white/5"
            onClick={() => setActiveSubTab('matches')}
          >
            <UploadCloud size={13} className="text-primary" />
            <span>Input Data</span>
          </Button>
          <Button className="flex-1 md:flex-none gap-2 shadow-lg shadow-primary/20 h-9 md:h-12 rounded-xl px-2 md:px-6 text-[10px] md:text-sm bg-primary hover:bg-primary/90">
            <TrendingUp size={13} /> <span>Live Stats</span>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveSubTab}>
        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 mb-6">
          <TabsList className="flex w-fit md:grid md:w-[750px] md:grid-cols-5 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl shadow-xl min-w-max">
            <TabsTrigger value="overview" className="rounded-lg md:rounded-xl px-4 md:px-auto py-1.5 md:py-2 text-[11px] md:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Overview</TabsTrigger>
            <TabsTrigger value="points" className="rounded-lg md:rounded-xl px-4 md:px-auto py-1.5 md:py-2 text-[11px] md:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Points Table</TabsTrigger>
            <TabsTrigger value="players" className="rounded-lg md:rounded-xl px-4 md:px-auto py-1.5 md:py-2 text-[11px] md:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Stats</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-lg md:rounded-xl px-4 md:px-auto py-1.5 md:py-2 text-[11px] md:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Milestones</TabsTrigger>
            <TabsTrigger value="matches" className="rounded-lg md:rounded-xl px-4 md:px-auto py-1.5 md:py-2 text-[11px] md:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Matches</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="premium-card bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Orange Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-orange-500 p-0.5">
                    <AvatarFallback className="bg-orange-500 text-white font-bold">
                      {mostRuns?.[0]?.name !== '-' ? mostRuns?.[0]?.name.split(' ').map(n => n[0]).join('') : '0'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-black">{mostRuns?.[0]?.name !== '-' ? mostRuns?.[0]?.name : 'No Data'}</div>
                    <div className="text-sm font-bold text-orange-500">{mostRuns?.[0]?.runs || 0} Runs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Purple Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-purple-500 p-0.5">
                    <AvatarFallback className="bg-purple-500 text-white font-bold">
                      {mostWickets?.[0]?.name !== '-' ? mostWickets?.[0]?.name.split(' ').map(n => n[0]).join('') : '0'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-black">{mostWickets?.[0]?.name !== '-' ? mostWickets?.[0]?.name : 'No Data'}</div>
                    <div className="text-sm font-bold text-purple-500">{mostWickets?.[0]?.wickets || 0} Wickets</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Table Topper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-2xl">
                    {getTeamLogo(pointsTable?.[0]?.team)}
                  </div>
                  <div>
                    <div className="text-xl font-black">{pointsTable?.[0]?.team || 'N/A'}</div>
                    <div className="text-sm font-bold text-emerald-500">{pointsTable?.[0]?.points || 0} Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <div className="text-xl font-black">Season 1</div>
                    <div className="text-sm font-bold text-blue-500">{nextMatches.length} Matches scheduled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Points Table Preview */}
            <Card className="lg:col-span-2 premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Points Table</CardTitle>
                  <CardDescription>Current standings of all teams</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSubTab('points')}>
                  View Full <ChevronRight size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-xs md:text-sm min-w-[500px] md:min-w-0">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border/50">
                        <th className="pb-3 font-bold px-2">POS</th>
                        <th className="pb-3 font-bold">TEAM</th>
                        <th className="pb-3 font-bold text-center">P</th>
                        <th className="pb-3 font-bold text-center">W</th>
                        <th className="pb-3 font-bold text-center">L</th>
                        <th className="pb-3 font-bold text-center">PTS</th>
                        <th className="pb-3 font-bold text-right px-2">NRR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {pointsTable.map((team, idx) => (
                        <tr key={team.team} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-bold text-muted-foreground">{idx + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getTeamLogo(team.team)}</span>
                              <span className="font-bold">{team.team}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center font-medium">{team.played}</td>
                          <td className="py-4 text-center font-medium text-emerald-500">{team.won}</td>
                          <td className="py-4 text-center font-medium text-destructive">{team.lost}</td>
                          <td className="py-4 text-center">
                            <Badge variant="secondary" className="font-black px-2.5 py-0.5">{team.points}</Badge>
                          </td>
                          <td className="py-4 text-right font-mono text-xs">{team.nrr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Matches */}
            <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle>Upcoming Matches</CardTitle>
                <CardDescription>Don't miss the action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-background">{match.date}</Badge>
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <Clock size={12} /> {match.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-2xl">{getTeamLogo(match.team1)}</span>
                        <span className="text-sm font-black">{match.team1}</span>
                      </div>
                      <div className="text-xs font-black text-muted-foreground/30">VS</div>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-2xl">{getTeamLogo(match.team2)}</span>
                        <span className="text-sm font-black">{match.team2}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-[10px] text-muted-foreground font-medium truncate">
                      <MapPin size={10} /> {match.venue}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 rounded-xl text-xs font-bold" onClick={() => setActiveSubTab('matches')}>
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="points">
          <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-6 border-b border-white/5">
              <div className="min-w-0">
                <CardTitle className="text-base md:text-xl font-black">Points Table</CardTitle>
                <CardDescription className="text-[9px] md:text-sm truncate">IPL 2024 Team Standings</CardDescription>
              </div>
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-7 md:h-8 px-1.5 md:px-3 text-[9px] md:text-xs gap-1 border-white/10">
                  <Filter size={10} className="md:w-3 md:h-3" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="h-7 md:h-8 px-1.5 md:px-3 text-[9px] md:text-xs gap-1 border-white/10">
                   Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-xs md:text-sm min-w-[320px] md:min-w-0">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-white/5 bg-white/[0.02]">
                      <th className="py-2.5 font-bold px-1.5 md:px-4 text-center w-8 md:w-10">POS</th>
                      <th className="py-2.5 font-bold">TEAM</th>
                      <th className="py-2.5 font-bold text-center w-7 md:w-12">P</th>
                      <th className="py-2.5 font-bold text-center w-7 md:w-12">W</th>
                      <th className="py-2.5 font-bold text-center w-7 md:w-12">L</th>
                      <th className="py-2.5 font-bold text-center w-10 md:w-16">PTS</th>
                      <th className="py-2.5 font-bold text-right px-2 md:px-4 w-14 md:w-20">NRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pointsTable.map((team, idx) => (
                      <tr key={team.team} className="group hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 md:py-5 font-black text-muted-foreground text-center px-1.5 md:px-4">
                          <span className={`w-4 h-4 md:w-6 md:h-6 rounded-full inline-flex items-center justify-center text-[8px] md:text-xs ${idx < 4 ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-muted/20'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 md:py-5">
                          <div className="flex items-center gap-1.5 md:gap-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-muted/30 flex items-center justify-center text-lg md:text-2xl group-hover:scale-105 transition-transform shrink-0">
                              {getTeamLogo(team.team, "w-5 h-5 md:w-8 md:h-8")}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-[10px] md:text-base truncate leading-tight">{team.team}</div>
                              <div className="text-[7px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{IPL_TEAMS.find(t => t.name === team.team)?.short}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 md:py-5 text-center font-bold text-xs md:text-lg">{team.played}</td>
                        <td className="py-3 md:py-5 text-center font-bold text-emerald-500 text-xs md:text-lg">{team.won}</td>
                        <td className="py-3 md:py-5 text-center font-bold text-destructive text-xs md:text-lg">{team.lost}</td>
                        <td className="py-3 md:py-5 text-center">
                          <Badge variant="secondary" className="font-black px-1.5 md:px-4 py-0 md:py-1 text-[10px] md:text-base bg-primary/10 text-primary border-none shadow-sm">
                            {team.points}
                          </Badge>
                        </td>
                        <td className="py-3 md:py-5 text-right font-mono text-[8px] md:text-sm px-2 md:px-4">
                          <span className={team.nrr.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}>
                            {team.nrr}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Most Runs */}
            <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                    <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                      <Target size={18} className="md:w-5 md:h-5" />
                    </div>
                    Most Runs
                  </CardTitle>
                </div>
                <Award className="text-orange-500 shrink-0" size={20} />
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="space-y-2 md:space-y-6">
                  {mostRuns.map((player, idx) => (
                    <div key={player.name} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-muted/50">
                            <AvatarFallback className="bg-muted font-bold text-sm md:text-lg">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -left-1 w-5 h-5 md:w-6 md:h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black border-2 border-background">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm md:text-lg truncate">{player.name}</div>
                          <div className="flex items-center gap-2 text-[8px] md:text-xs font-bold text-muted-foreground uppercase">
                            <span style={{ color: getTeamColor(player.team) }}>{player.team}</span>
                            <span>•</span>
                            <span className="truncate">{player.matches} Matches</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg md:text-2xl font-black text-orange-500">{player.runs}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Runs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Wickets */}
            <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                    <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
                      <Zap size={18} className="md:w-5 md:h-5" />
                    </div>
                    Most Wickets
                  </CardTitle>
                </div>
                <Award className="text-purple-500 shrink-0" size={20} />
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="space-y-2 md:space-y-6">
                  {mostWickets.map((player, idx) => (
                    <div key={player.name} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-muted/50">
                            <AvatarFallback className="bg-muted font-bold text-sm md:text-lg">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -left-1 w-5 h-5 md:w-6 md:h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black border-2 border-background">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm md:text-lg truncate">{player.name}</div>
                          <div className="flex items-center gap-2 text-[8px] md:text-xs font-bold text-muted-foreground uppercase">
                            <span style={{ color: getTeamColor(player.team) }}>{player.team}</span>
                            <span>•</span>
                            <span className="truncate">{player.matches} Matches</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg md:text-2xl font-black text-purple-500">{player.wickets}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Wickets</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6 md:space-y-8">
          {/* Highest Individual Scores */}
          <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl mb-6 md:mb-8">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                  <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                    <TrendingUp size={18} className="md:w-6 md:h-6" />
                  </div>
                  Highest Scores
                </CardTitle>
                <CardDescription className="text-[10px] md:text-sm">Top batting performances</CardDescription>
              </div>
              <TrendingUp className="text-rose-500 opacity-20 shrink-0" size={32} />
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {(highestScores || []).map((score, idx) => (
                  <div key={`${score.name}-${idx}`} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center font-black text-xs md:text-sm">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm md:text-lg group-hover:text-rose-400 transition-colors truncate">{score.name}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <span style={{ color: getTeamColor(score.team) }}>{score.team}</span>
                          <span>•</span>
                          <span className="truncate">Inn {score.innType === 'innings1' ? '1' : '2'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg md:text-2xl font-black text-rose-500">{score.runs}{score.notOut ? '*' : ''}</div>
                      <div className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase">{score.balls} Balls</div>
                    </div>
                  </div>
                ))}
              </div>
              {(highestScores || []).length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-bold">No scores recorded yet.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Most Fifties */}
            <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                    <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                      <Star size={18} className="md:w-5 md:h-5" />
                    </div>
                    Most Fifties (50s)
                  </CardTitle>
                </div>
                <Award className="text-blue-500 shrink-0" size={20} />
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="space-y-2 md:space-y-6">
                  {[...mostRuns]
                    .filter(p => p.fifties > 0)
                    .sort((a, b) => b.fifties - a.fifties || b.runs - a.runs)
                    .slice(0, 5)
                    .map((player, idx) => (
                    <div key={player.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 border-2 border-muted/50">
                            <AvatarFallback className="bg-muted font-bold text-lg">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-black text-lg">{player.name}</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                            <span style={{ color: getTeamColor(player.team) }}>{player.team}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-500">{player.fifties}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fifties</div>
                      </div>
                    </div>
                  ))}
                  {mostRuns.filter(p => p.fifties > 0).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground font-bold">No 50s recorded yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Centuries */}
            <Card className="premium-card bg-[#0d121d]/80 backdrop-blur-xl border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                    <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
                      <Trophy size={18} className="md:w-5 md:h-5" />
                    </div>
                    Most Centuries
                  </CardTitle>
                </div>
                <Award className="text-yellow-500 shrink-0" size={20} />
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="space-y-2 md:space-y-6">
                  {[...mostRuns]
                    .filter(p => p.hundreds > 0)
                    .sort((a, b) => b.hundreds - a.hundreds || b.runs - a.runs)
                    .slice(0, 5)
                    .map((player, idx) => (
                    <div key={player.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 border-2 border-muted/50">
                            <AvatarFallback className="bg-muted font-bold text-lg">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-black text-lg">{player.name}</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                            <span style={{ color: getTeamColor(player.team) }}>{player.team}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-yellow-500">{player.hundreds}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Centuries</div>
                      </div>
                    </div>
                  ))}
                  {mostRuns.filter(p => p.hundreds > 0).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground font-bold">No 100s recorded yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-4 pt-4">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2">
                <Calendar className="text-primary" size={24} />
                Season 1 Schedule
              </h2>
            </div>

            <div className="space-y-4 md:space-y-3">
              {nextMatches.map((match) => (
                <div key={match.id} className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 ${match.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/40 bg-muted/5 hover:bg-muted/10'}`}>
                  <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6 p-4 md:p-6">
                    {/* Match Info */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between w-full lg:w-auto lg:min-w-[100px] border-b lg:border-b-0 lg:border-r border-border/30 pb-3 lg:pb-0 lg:pr-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest">{match.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg md:text-xl font-black">MATCH {match.id}</span>
                          {match.status === 'completed' && <CheckCircle2 size={14} className="text-emerald-500 md:w-4 md:h-4" />}
                        </div>
                      </div>
                      <span className="text-[10px] md:text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full lg:bg-transparent lg:px-0 lg:py-0">{match.time}</span>
                    </div>
 
                    {/* Matchup */}
                    <div className="flex-1 flex items-center justify-between w-full lg:justify-center gap-4 md:gap-8 md:gap-12 py-2">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-background border border-border/50 flex items-center justify-center text-2xl md:text-3xl shadow-sm group-hover:scale-110 transition-transform">
                          {getTeamLogo(match.team1)}
                        </div>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-center">{match.team1}</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-muted/50 text-[8px] md:text-[10px] font-black text-muted-foreground border border-border/30">VS</div>
                      </div>
 
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-background border border-border/50 flex items-center justify-center text-2xl md:text-3xl shadow-sm group-hover:scale-110 transition-transform">
                          {getTeamLogo(match.team2)}
                        </div>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-center">{match.team2}</span>
                      </div>
                    </div>
 
                    {/* Toss/Status */}
                    <div className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] border border-border/20 w-full lg:w-auto lg:min-w-[300px] ${match.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted/20'}`}>
                      <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center ${match.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {match.status === 'completed' ? <Trophy size={16} className="md:w-[18px] md:h-[18px]" /> : <Zap size={16} className="md:w-[18px] md:h-[18px]" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                          {match.status === 'completed' ? 'Result' : 'Status'}
                        </span>
                        <span className={`text-[10px] md:text-xs font-bold italic leading-tight truncate ${match.status === 'completed' ? 'text-emerald-500' : 'text-foreground'}`}>
                          {match.venue}
                        </span>
                      </div>
                    </div>

                    {/* Action - Upload for each match */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {match.status === 'pending' ? (
                        <Button
                          variant="outline"
                          className="rounded-xl md:rounded-2xl border-primary/20 px-3 md:px-4 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary flex-1 md:flex-none"
                          onClick={() => openManualInputDialog(match, 'innings1')}
                        >
                          Input 1st Inn
                        </Button>
                      ) : match.status === 'innings1' ? (
                        <Button
                          variant="outline"
                          className="rounded-xl md:rounded-2xl border-orange-500/20 px-3 md:px-4 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-orange-500 flex-1 md:flex-none"
                          onClick={() => openManualInputDialog(match, 'innings2')}
                        >
                          Input 2nd Inn
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-xl font-black text-[9px] md:text-[10px] py-1.5 md:py-2">COMPLETED</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl md:rounded-2xl h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-primary"
                        onClick={() => setViewingMatch(match)}
                      >
                        <ArrowRight size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl md:rounded-2xl h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={(e) => handleDeleteMatch(match.id, e)}
                        title="Match data delete karo"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={manualInputOpen} onOpenChange={setManualInputOpen}>
        <DialogContent className="max-w-3xl border-border/50 bg-[#0d121d] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {manualInputMatch ? `Match ${manualInputMatch.id} - ${manualInputType}` : 'Manual Score Input'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              JSON paste karo: `team`, `totalScore`, `totalOvers`, `extras`, `fifties`, `hundreds`, `batters`
            </p>
            <textarea
              value={manualScoreText}
              onChange={(e) => setManualScoreText(e.target.value)}
              className="min-h-[420px] w-full rounded-2xl border border-border/40 bg-[#111827] p-4 font-mono text-sm text-white outline-none"
              placeholder='{"team":"","totalScore":"","totalOvers":"","extras":0,"fifties":[],"hundreds":[],"batters":[]}'
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="rounded-2xl" onClick={() => setManualInputOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-2xl" onClick={handleManualScoreSave} disabled={savingManualScore}>
                {savingManualScore ? 'Saving...' : 'Save Scorecard'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CricketFun;
