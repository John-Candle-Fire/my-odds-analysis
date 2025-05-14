// src/utils/winQuinellaAnalysis.js
// version 1.0.1 added analyzeExpectedQuinellaOdds function to analyze expected quinella odds based on win odds
// version 1.0.2 enhanced alert message with actual Q odds
// version 1.0.3 added positive residual summary alerts for horses with win odds <= 20
import { createAlert, addAlert, addAlerts } from './alertSystem';

/**
 * Gets all quinella pairs involving a specific horse
 * @param {QuinellaPair[]} quinellaOdds 
 * @param {string} horseNumber 
 * @returns {QuinellaPair[]}
 */
const getQuinellaPairsForHorse = (quinellaOdds, horseNumber) => {
  return quinellaOdds.filter(q => 
    q.horse_number_1 === horseNumber || 
    q.horse_number_2 === horseNumber
  );
};

/**
 * Calculates expected quinella odds based on the linear regression model
 * Expected Q = 6.44 + (0.415 * Win1 * Win2)
 * Generates summary alerts on count of horses with positive residuals and list out the other legs
 * @param {RaceData} raceData 
 * @returns {AlertMessage[]} Array of alert messages
 */
const analyzeExpectedQuinellaOdds = (raceData) => {
  if (!raceData.quinella_odds || !raceData.odds) return [];
  
  const winOddsMap = {};
  raceData.odds.forEach(horse => {
    winOddsMap[horse.horseNumber] = horse.win;
  });

  const alerts = [];
  const STANDARD_ERROR = 23.68;
  const positiveResidualMap = new Map();

  // Initialize map for all horses with win odds <= 20
  raceData.odds.forEach(horse => {
    if (horse.win <= 20) {
      positiveResidualMap.set(horse.horseNumber, new Set());
    }
  });

  raceData.quinella_odds.forEach(pair => {
    const winProduct = winOddsMap[pair.horse_number_1] * winOddsMap[pair.horse_number_2];
    const expectedQOdds = 6.44 + (0.415 * winProduct);
    const residual = expectedQOdds - pair.odds;
    const standardizedResidual = residual / STANDARD_ERROR;
    const comboId = `${pair.horse_number_1}-${pair.horse_number_2}`;
    

    alerts.push(createAlert(
      30,
      comboId,
      'Analyze',
      `Expected Q: ${expectedQOdds.toFixed(2)}, Actual Q: ${pair.odds.toFixed(2)}, Residual: ${residual.toFixed(2)}, Z-score: ${standardizedResidual.toFixed(2)}`,
      0,
      0,
      'Generic'
    ));

    // positive residual logic 
    if (residual > 0) {
      const [horseA, horseB] = [pair.horse_number_1, pair.horse_number_2];
      
      if (winOddsMap[horseA] <= 20) {
        positiveResidualMap.get(horseA)?.add(horseB);
      }
      if (winOddsMap[horseB] <= 20) {
        positiveResidualMap.get(horseB)?.add(horseA);
      }
    }
    
  });

  // Generate individual summary alerts (same format for both methods)
  positiveResidualMap.forEach((partners, horseNumber) => {
    if (partners.size > 0) {
      const partnersList = Array.from(partners).sort().join(' + ');
      alerts.push(createAlert(
        140,
        horseNumber,
        'Analyze',
        `Q - ${partners.size} 瓣 Q 拖 ${partnersList} 有飛`,
        5,
        5,
        'Generic'
      ));
    }
  });

  return alerts;
};

/**
 * Analyzes Win vs Quinella odds relationships
 * @param {RaceData} raceData - Complete race data
 * @param {RaceHorse[]} groupHorses - Horses in current odds group
 */
export const analyzeWinQuinella = (raceData, groupHorses) => {
  // Early exit if no quinella data
  if (!raceData.quinella_odds || raceData.quinella_odds.length === 0) return;

  // First run the expected quinella odds analysis
  const expectedOddsAlerts = analyzeExpectedQuinellaOdds(raceData);
  addAlerts(expectedOddsAlerts);

  // Single horse group case
  if (groupHorses.length === 1) {
    if (groupHorses[0].win <= 20) {
      addAlert(createAlert(20, groupHorses[0].horseNumber, 'Info', 
        'only horse in group with reasonable odds', 5, 10));
    }
    return;
  }

  // Compare all horse pairs in the group
  for (let i = 0; i < groupHorses.length; i++) {
    for (let j = i + 1; j < groupHorses.length; j++) {
      const horseA = groupHorses[i];
      const horseB = groupHorses[j];
      
      const pairsA = getQuinellaPairsForHorse(raceData.quinella_odds, horseA.horseNumber);
      const pairsB = getQuinellaPairsForHorse(raceData.quinella_odds, horseB.horseNumber);
      
      // Find common legs (horses paired with both A and B)
      const commonLegs = new Set();
      pairsA.forEach(pair => {
        const leg = pair.horse_number_1 === horseA.horseNumber 
          ? pair.horse_number_2 
          : pair.horse_number_1;
        commonLegs.add(leg);
      });
      
      // Compare odds for common legs
      pairsB.forEach(pair => {
        const leg = pair.horse_number_1 === horseB.horseNumber 
          ? pair.horse_number_2 
          : pair.horse_number_1;
        
        if (commonLegs.has(leg)) {
          const pairA = pairsA.find(p => 
            (p.horse_number_1 === horseA.horseNumber && p.horse_number_2 === leg) ||
            (p.horse_number_2 === horseA.horseNumber && p.horse_number_1 === leg)
          );
          
          const pairB = pairsB.find(p => 
            (p.horse_number_1 === horseB.horseNumber && p.horse_number_2 === leg) ||
            (p.horse_number_2 === horseB.horseNumber && p.horse_number_1 === leg)
          );
          
          if (pairA && pairB && horseA.win <= horseB.win) {
            if (pairA.odds > pairB.odds) {
              addAlert(createAlert(20, horseB.horseNumber, 'Info', 
                'Q better', 2, 2));
            } else {
              addAlert(createAlert(20, horseA.horseNumber, 'Info', 
                'Q odds OK', 2, 2));
            }
          }
        }
      });
    }
  }
};