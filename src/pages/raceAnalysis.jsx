// src/pages/raceAnalysis.jsx
// version 1.01 add pace map tab
import '../styles/main.css';
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loadRaceData } from '../utils/dataLoader';
import { analyzeRace } from '../utils/oddsAnalysis';
import FindingsDisplay from '../components/findingsDisplay';
import RaceSelector from '../components/raceSelector';
import QuinellaMatrix from '../components/quinellaMatrix';
import { getHighlights, resetHighlights } from '../utils/alertSystem';
import QuinellaPlaceMatrix from '../components/quinellaPlaceMatrix';
import PaceMap from '../components/paceMap';
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const RaceAnalysis = () => {
  const { user } = useAuth();
  const [findings, setFindings] = useState([]);
  const [raceData, setRaceData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [highlights, setHighlights] = useState({
    win: [],
    place: [],
    quinella: [],
    placeQuinella: []
  });
  const [priorityThreshold, setPriorityThreshold] = useState(300);

  const handleAnalyze = async ({ date, raceNumber, timestamp }) => {
    try {
      resetHighlights();
      const data = await loadRaceData(date, raceNumber, timestamp);
      setRaceData(data);
      setFindings(analyzeRace(data));
      setHighlights(getHighlights());
      setTabValue(0);
    } catch (error) {
      setFindings([{
        priority: 0,
        horseNumber: 'ALL',
        action: 'Alert',
        message: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        winScore: 0,
        placeScore: 0
      }]);
    }
  };

  const handleDownloadResults = () => {
    if (!raceData || !findings.length) return;

    const analysisResult = {
      metadata: {
        date: raceData.raceInfo.date,
        raceNumber: raceData.raceInfo.raceNumber,
        analyzedAt: new Date().toISOString(),
        priorityThreshold
      },
      findings: findings.filter(f => f.priority >= priorityThreshold),
      horseInfo: raceData.horseInfo
    };

    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-p${priorityThreshold}-${raceData.raceInfo.date}-${raceData.raceInfo.raceNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const HorseInfoTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Horse Information</Typography>
      {raceData?.horseInfo ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: '#2c3e50',
                '& th': { color: 'white', fontWeight: 'bold' }
              }}>
                <TableCell>馬號</TableCell>
                <TableCell>馬名</TableCell>
                <TableCell>負磅</TableCell>
                <TableCell>練馬師</TableCell>
                <TableCell>騎師</TableCell>
                <TableCell>檔位</TableCell>
                <TableCell>初步貼士指數</TableCell>
                <TableCell>賽日貼士指數</TableCell>
                <TableCell align="right">Win</TableCell>
                <TableCell align="right">Place</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {raceData.horseInfo.Horses.map((horse) => (
                <TableRow key={horse["Horse Number"]}>
                  <TableCell>{horse["Horse Number"]}</TableCell>
                  <TableCell>{horse["Horse Name"]}</TableCell>
                  <TableCell>{horse.Weight}</TableCell>
                  <TableCell>{horse.Trainer}</TableCell>
                  <TableCell>{horse.Jockey}</TableCell>
                  <TableCell>{horse.Post}</TableCell>
                  <TableCell>{horse["First Win Index"]}</TableCell>
                  <TableCell>{horse["Race Day Win Index"]}</TableCell>
                  <TableCell 
                    align="right"
                    className={highlights.win.includes(horse["Horse Number"]) ? 'highlight-win' : ''}
                  >
                    {horse.Win}
                  </TableCell>
                  <TableCell 
                    align="right"
                    className={highlights.place.includes(horse["Horse Number"]) ? 'highlight-place' : ''}
                  >
                    {horse.Place}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No horse information available for this race
        </Typography>
      )}
    </Box>
  );

  const MatricesTab = () => (
    <Box sx={{ mt: 3 }}>
      {raceData?.quinella_odds?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <QuinellaMatrix 
            quinellaOdds={raceData.quinella_odds} 
            horseCount={raceData.odds?.length || 0} 
            highlights={highlights.quinella}
          />
        </Box>
      )}
      {raceData?.quinella_place_odds?.length > 0 && (
        <Box>
          <QuinellaPlaceMatrix 
            quinellaPlaceOdds={raceData.quinella_place_odds} 
            horseCount={raceData.odds?.length || 0} 
            highlights={highlights.placeQuinella}
          />
        </Box>
      )}
    </Box>
  );

  const FindingsTab = () => (
    <Box sx={{ mt: 3 }}>
      <FindingsDisplay findings={findings} />
    </Box>
  );

  const PaceMapTab = ({ paceData, raceData, highlights }) => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Pace Map</Typography>
      {/* Metadata Section */}
      <Box sx={{ mb: 2 }}>
        <Typography>
          <strong> {paceData.pace}</strong>{'    ('}
          <strong>{paceData.course}</strong>{' '}
          <strong> {paceData.class}</strong>{' '}
          <strong> {paceData.track}</strong>{' '}
          <strong> {paceData.distance}M</strong>{') '}
        </Typography>
      </Box>
      {/* Pace Map Component */}
      <PaceMap paceData={paceData} raceData={raceData} highlights={highlights} />
    </Box>
  );

  const HorseDetailsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Horse Details</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Horse</TableCell>
              <TableCell align="right">Win Odds</TableCell>
              <TableCell align="right">Place Odds</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {raceData?.odds?.map((horse) => (
              <TableRow key={horse.horseNumber}>
                <TableCell>{horse.horseNumber}. {horse.horseName}</TableCell>
                <TableCell 
                  align="right"
                  className={highlights.win.includes(horse.horseNumber) ? 'highlight-win' : ''}
                >
                  {horse.win}
                </TableCell>
                <TableCell 
                  align="right"
                  className={highlights.place.includes(horse.horseNumber) ? 'highlight-place' : ''}
                >
                  {horse.place}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const tabComponents = [
    <HorseInfoTab key="horse-info" />,
    <MatricesTab key="matrices" />,
    <FindingsTab key="findings" />,
    raceData?.paceData && <PaceMapTab 
      key="pace-map" 
      paceData={raceData.paceData}
      raceData={raceData}
      highlights={highlights} />,
    <HorseDetailsTab key="horse-details" />
  ].filter(Boolean);

  return (
    <div className="race-analysis-container">
      {user && (
        <div style={{
          backgroundColor: '#f0f0f0',
          padding: '8px',
          marginBottom: '15px',
          borderRadius: '4px',
          textAlign: 'right',
          fontSize: '0.9em'
        }}>
          Logged in as: <strong>{user.username}</strong> ({user.role})
        </div>
      )}
      
      <RaceSelector onAnalyze={handleAnalyze} />
      
      {/* Download Controls */}
      <div className="download-controls" style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '10px' }}>
          <label htmlFor="priorityThreshold">Minimum Priority: </label>
          <input
            id="priorityThreshold"
            type="number"
            min="0"
            max="1000"
            value={priorityThreshold}
            onChange={(e) => setPriorityThreshold(Number(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>
        <button
          type="button"
          onClick={handleDownloadResults}
          disabled={!raceData || findings.every(f => f.priority < priorityThreshold)}
          className="download-btn"
        >
          Download Filtered Results
        </button>
      </div>

      
      <Box sx={{ width: '100%', mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
          <Tab label="Horse Info" />
          <Tab label="Q & PQ Odds" />
          <Tab label="Findings" />
          {raceData?.paceData && <Tab label="Pace Map" />}
          <Tab label="Not Used" />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        {tabComponents[tabValue]}
      </Box>
    </div>
  );
};

export default RaceAnalysis;