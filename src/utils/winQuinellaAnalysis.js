// src/utils/winQuinellaAnalysis.js
import { createAlert, addAlert } from './alertSystem';

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
 * Analyzes Win vs Quinella odds relationships
 * @param {RaceData} raceData - Complete race data
 * @param {RaceHorse[]} groupHorses - Horses in current odds group
 */
export const analyzeWinQuinella = (raceData, groupHorses) => {
  // Early exit if no quinella data
  if (!raceData.quinella_odds || raceData.quinella_odds.length === 0) return;

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