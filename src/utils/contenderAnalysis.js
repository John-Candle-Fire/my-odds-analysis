// src/utils/contenderAnalysis.js
/**
 * Analysis for Contenders group (5 < Win ≤10)
 */

/** 
 * @typedef {import('./types.js').RaceData} RaceData
 * @typedef {import('./types.js').AlertMessage} AlertMessage
 * @typedef {import('./types.js').GroupConfig} GroupConfig
 */

import { createAlert, addAlert } from './alertSystem.js';
import { getHorsesInGroup } from './coreAnalysis.js';
import { compareQuinellaDominance } from './quinellaComparison.js';
import { comparePQDominance } from './pqComparison.js';
import { DEFAULT_GROUPS } from './coreAnalysis.js';

/**
 * Analyzes Contenders group horses with different logic based on favorite status
 * @param {RaceData} raceData - Complete race data
 * @param {boolean} isOnlyFavourite - If favorite group has only one horse
 * @param {boolean} isBeatIndex - If favorite horse beats its Race Day Win Index
 * @param {string} [favouriteHorseNumber] - Number of favorite horse if applicable
 * @returns {AlertMessage[]} Generated alerts
 */
export function analyzeContenders(
  raceData,
  isOnlyFavourite,
  isBeatIndex,
  favouriteHorseNumber
) {
  const alerts = [];
  const contendersGroup = DEFAULT_GROUPS.find(g => g.category === "Contenders");
  
  if (!contendersGroup || !raceData?.odds) return alerts;

  // Get qualified contenders (those beating their index)
  const contendersHorses = getHorsesInGroup(raceData.odds, contendersGroup);
  const qualifiedContenders = contendersHorses.filter(horse => {
    const horseDetail = raceData.horseInfo?.Horses?.find(h => 
      h['Horse Number'] === horse.horseNumber
    );
    return horse.win <= (horseDetail?.['Race Day Win Index'] || Infinity);
  });

  // Case 1: Only one qualified contender
  if (qualifiedContenders.length === 1) {
    const horse = qualifiedContenders[0];
    const horseDetail = raceData.horseInfo?.Horses?.find(h => 
      h['Horse Number'] === horse.horseNumber
    );
    alerts.push(createAlert(
      160,
      horse.horseNumber,
      'Analyze',
      `${contendersGroup.name} ${horseDetail?.['Horse Name'] || horse.horseNumber} 今場抵買機會馬`,
      30, // winScore
      30  // placeScore
    ));
    return alerts;
  }

  // Case 2: Multiple qualified contenders
  if (qualifiedContenders.length > 1) {
    if (isOnlyFavourite && isBeatIndex && favouriteHorseNumber) {
      // Compare against favorite
      analyzeAgainstFavorite(
        qualifiedContenders,
        favouriteHorseNumber,
        raceData,
        alerts
      );
    } else {
      // Compare among contenders
      analyzeWithinGroup(
        qualifiedContenders,
        raceData,
        alerts
      );
    }
  }

  return alerts;
}

/**
 * Compares contenders against the favorite horse
 * @param {RaceHorse[]} contenders
 * @param {string} favoriteHorseNumber
 * @param {RaceData} raceData
 * @param {AlertMessage[]} alerts
 */
function analyzeAgainstFavorite(contenders, favoriteHorseNumber, raceData, alerts) {
  const allHorseNumbers = raceData.odds.map(h => h.horseNumber);
  const otherLegs = allHorseNumbers.filter(n => 
    n !== favoriteHorseNumber && 
    !contenders.some(c => c.horseNumber === n)
  );

  // Compare each contender pair using favorite as common leg
  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const horseA = contenders[i];
      const horseB = contenders[j];

      // Quinella comparison
      const qDominance = compareQuinellaDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        [favoriteHorseNumber],
        raceData.quinella_odds
      );

      if (qDominance !== "0") {
        const dominant = qDominance === horseA.horseNumber ? horseA : horseB;
        const other = qDominance === horseA.horseNumber ? horseB : horseA;
        
        if (dominant.win > other.win) {
          addComparisonAlert(
            dominant, 
            other, 
            'Quinella', 
            raceData.horseInfo,
            alerts
          );
        }
      }

      // Place Quinella comparison
      const pqDominance = comparePQDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        [favoriteHorseNumber],
        raceData.quinella_place_odds
      );

      if (pqDominance !== "0") {
        const dominant = pqDominance === horseA.horseNumber ? horseA : horseB;
        const other = pqDominance === horseA.horseNumber ? horseB : horseA;
        
        if (dominant.win > other.win) {
          addComparisonAlert(
            dominant, 
            other, 
            'PQ', 
            raceData.horseInfo,
            alerts
          );
        }
      }
    }
  }
}

/**
 * Compares contenders among themselves using all horses as legs
 * @param {RaceHorse[]} contenders
 * @param {RaceData} raceData
 * @param {AlertMessage[]} alerts
 */
function analyzeWithinGroup(contenders, raceData, alerts) {
  const allHorseNumbers = raceData.odds.map(h => h.horseNumber);
  
  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const horseA = contenders[i];
      const horseB = contenders[j];

      // Quinella comparison
      const qDominance = compareQuinellaDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        allHorseNumbers.filter(n => n !== horseA.horseNumber && n !== horseB.horseNumber),
        raceData.quinella_odds
      );

      if (qDominance !== "0") {
        const dominant = qDominance === horseA.horseNumber ? horseA : horseB;
        const other = qDominance === horseA.horseNumber ? horseB : horseA;
        
        if (dominant.win > other.win) {
          addComparisonAlert(
            dominant, 
            other, 
            'Quinella', 
            raceData.horseInfo,
            alerts
          );
        }
      }

      // Place Quinella comparison
      const pqDominance = comparePQDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        allHorseNumbers.filter(n => n !== horseA.horseNumber && n !== horseB.horseNumber),
        raceData.quinella_place_odds
      );

      if (pqDominance !== "0") {
        const dominant = pqDominance === horseA.horseNumber ? horseA : horseB;
        const other = pqDominance === horseA.horseNumber ? horseB : horseA;
        
        if (dominant.win > other.win) {
          addComparisonAlert(
            dominant, 
            other, 
            'PQ', 
            raceData.horseInfo,
            alerts
          );
        }
      }
    }
  }
}

/**
 * Creates standardized comparison alert
 * @param {RaceHorse} dominantHorse
 * @param {RaceHorse} otherHorse
 * @param {'Quinella'|'PQ'} comparisonType
 * @param {HorseInfo} horseInfo
 * @param {AlertMessage[]} alerts
 */
function addComparisonAlert(dominantHorse, otherHorse, comparisonType, horseInfo, alerts) {
  const dominantDetail = horseInfo?.Horses?.find(h => 
    h['Horse Number'] === dominantHorse.horseNumber
  );
  const otherDetail = horseInfo?.Horses?.find(h => 
    h['Horse Number'] === otherHorse.horseNumber
  );

  alerts.push(createAlert(
    150,
    dominantHorse.horseNumber,
    'Info',
    `${dominantHorse.horseNumber} ${dominantDetail?.['Horse Name'] || ''} has suspicious ${comparisonType} wager as compared to ${otherHorse.horseNumber} ${otherDetail?.['Horse Name'] || ''}`,
    20, // winScore
    20  // placeScore
  ));
}