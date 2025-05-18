// src/utils/oddsAnalysis.js
// v1.0.1 add deduplicateAlerts
// v1.0.2 add handleAlertAction
import { createAlert, getAlerts, clearAlerts, addAlerts, deduplicateAlerts, handleAlertAction, resetHighlights } from './alertSystem';
import { DEFAULT_GROUPS } from './coreAnalysis';
import { 
  findWinFavorite,
  findPlaceFavorite,
  findQuinellaFavorite,
  findPQFavorite 
} from './favorites';
import { analyzeWinPlace } from './winPlaceAnalysis';
import { analyzeWinRaceDayIndex } from './winInsiderAnalysis';
import { analyzeWinQuinella } from './winQuinellaAnalysis';
import { analyzeWinPlaceQuinella } from './winPQAnalysis';
import { analyzeWinWinX, analyzeWinWin } from './winWinAnalysis';
import { preprocessRaceData } from './dataPreprocessor';



/**
 * Debug helper to log alerts state
 * @param {string} stage - Identification of the debug point
 */
const debugAlerts = (stage) => {
  const alerts = getAlerts();
  console.log(`[${stage}] Alerts State`, {
    count: alerts.length,
    sample: alerts[0] || null,
    types: [...new Set(alerts.map(a => a?.action))] // Unique action types
  });
};

/**
 * Gets horses within a specific win odds range
 * @param {RaceHorse[]} horses 
 * @param {GroupConfig} group 
 * @returns {RaceHorse[]}
 */
function getHorsesInGroup(horses, group) {
  const [min, max] = group.range;
  return horses.filter(horse => horse.win > min && horse.win <= max);
}

/**
 * Main race analysis function
 * @param {RaceData} data 
 * @returns {AlertMessage[]}
 */
export function analyzeRace(data) {
  clearAlerts();
  resetHighlights(); // Reset previous highlights
  console.log('[1] Starting analysis, cleared existing alerts');

  // 1. Validate data
  if (!data?.odds?.length) {
    const alert = createAlert(0, "ALL", "Alert", "No odds data", 0, 0);
    console.log('[2] No odds data, returning:', alert);
    return [alert];
  }
  console.log('[3] Valid data with', data.odds.length, 'horses');


  // 1.5 Preprocess data
  const preprocessedData = preprocessRaceData(data);
  console.log('[3] Preprocessed data:', {
    horses: preprocessedData.horses.length,
    quinellaPairs: preprocessedData.quinellaPairs.length
    
  });   


  // 2 Run favorite analyses
  const winFavorites = findWinFavorite(data.odds, data.horseInfo);
  console.log('[4] Win favorites found:', winFavorites.length);
  addAlerts(winFavorites);
  debugAlerts('After Win Favorites');

  const placeFavorites = findPlaceFavorite(data.odds, data.horseInfo);
  console.log('[5] Place favorites found:', placeFavorites.length);
  addAlerts(placeFavorites);

  if (data.quinella_odds) {
    const qFavorites = findQuinellaFavorite(data.quinella_odds);
    console.log('[6] Quinella favorites found:', qFavorites.length);
    addAlerts(qFavorites);
  }

  if (data.quinella_place_odds) {
    const pqFavorites = findPQFavorite(data.quinella_place_odds);
    console.log('[7] PQ favorites found:', pqFavorites.length);
    addAlerts(pqFavorites);
  }

  debugAlerts('After Q & PQ Favorites');

  // 3. Run Win-Win analysis
  analyzeWinWinX(preprocessedData);
  debugAlerts('After Win-Win Analysis');

  // 3. Process each analysis group
  DEFAULT_GROUPS.forEach(group => {
    const groupHorses = preprocessedData.horses.filter(horse => horse.category === group.category);
    console.log(`[8] Group ${group.name} has`, groupHorses.length, 'horses');

    if (groupHorses.length === 0) {
      console.log(`[9] Skipping empty group ${group.name}`);
      return; // Just skip to next group instead of adding alert
    }

    analyzeWinPlace(groupHorses);
    console.log('[10] Win-Place analysis completed for group', group.name);
    debugAlerts('After Win Place in Group');

    if (groupHorses.length > 0) {
      analyzeWinRaceDayIndex(groupHorses);
      console.log('[11] Win-RaceDay analysis completed for group', group.name);
    }

    if (preprocessedData.quinellaPairs.length > 0) {
      analyzeWinQuinella(preprocessedData, groupHorses);
      console.log('[12] Win-Quinella analysis completed for group', group.name);
    }
    debugAlerts('After Win-Quinella in Group');
    
    if (preprocessedData.placeQPairs.length > 0) {
      analyzeWinPlaceQuinella(preprocessedData, groupHorses);
      console.log('[13] Win-PQ analysis completed for group', group.name);
    }
    debugAlerts('After PQ in Group');
  });

  const finalAlerts = getAlerts();
  finalAlerts.forEach(handleAlertAction); // Process highlights
  console.log('[14] Final alerts:', {
    count: finalAlerts.length,
    sample: finalAlerts[0],
    priorities: finalAlerts.map(a => a.priority)
  });
  debugAlerts('Prior return');
  return deduplicateAlerts(finalAlerts);
}