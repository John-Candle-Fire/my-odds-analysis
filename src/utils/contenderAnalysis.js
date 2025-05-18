// src/utils/contenderAnalysis.js
/**
 * Analysis for Contenders group (5 < Win ≤10)
 */

/**
 * @typedef {import('./types.js').PreprocessedRaceData} PreprocessedRaceData
 * @typedef {import('./types.js').PreprocessedHorse} PreprocessedHorse
 * @typedef {import('./types.js').AlertMessage} AlertMessage
 */

import { createAlert, addAlert } from './alertSystem.js';
import { compareQuinellaDominance } from './quinellaComparison.js';
import { comparePQDominance } from './pqComparison.js';

/**
 * Analyzes Contenders group horses with different logic based on favorite status
 * @param {PreprocessedRaceData} preprocessedData - Preprocessed race data
 * @param {boolean} isOnlyFavourite - If favorite group has only one horse
 * @param {boolean} anyBeatIndex - If any favorite horse beats its Race Day Win Index
 * @param {string} [favouriteHorseNumber] - Number of favorite horse if applicable
 * @returns {AlertMessage[]} Generated alerts
 */
export function analyzeContenders(
  preprocessedData,
  isOnlyFavourite,
  anyBeatIndex,
  favouriteHorseNumber
) {
  const alerts = [];

  // Get contenders horses directly from preprocessed data
  const contendersHorses = preprocessedData.horses.filter(horse => horse.category === "Contenders");

  // Get qualified contenders (those beating their index)
  const qualifiedContenders = contendersHorses.filter(horse => horse.isBeatIndex);

  // Case 1: Only one qualified contender
  if (qualifiedContenders.length === 1) {
    const horse = qualifiedContenders[0];
    if (horse.place <= horse.expectedP) {
      alerts.push(createAlert(
        170,
        horse.horseNumber,
        'Analyze',
        `挑戰者 - ${horse.horseName} 今場抵買機會馬`,
        30, // winScore
        30  // placeScore
      ));
    }
    return alerts;
  }

  // Case 2: Multiple qualified contenders
  if (qualifiedContenders.length > 1) {
    if (isOnlyFavourite && anyBeatIndex && favouriteHorseNumber) {
      // Compare against favorite
      analyzeAgainstFavorite(
        qualifiedContenders,
        favouriteHorseNumber,
        preprocessedData,
        alerts
      );
    } else {
      // Compare among contenders
      analyzeWithinGroup(
        qualifiedContenders,
        preprocessedData,
        alerts
      );
    }
  }

  return alerts;
}

/**
 * Compares contenders against the favorite horse
 * @param {PreprocessedHorse[]} contenders - Array of contender horses
 * @param {string} favoriteHorseNumber - Favorite horse number
 * @param {PreprocessedRaceData} preprocessedData - Preprocessed race data
 * @param {AlertMessage[]} alerts - Array to store generated alerts
 */
function analyzeAgainstFavorite(contenders, favoriteHorseNumber, preprocessedData, alerts) {
  const allHorseNumbers = preprocessedData.horses.map(h => h.horseNumber);

  // Prepare quinella odds in the expected format
  const quinellaOdds = preprocessedData.quinellaPairs.map(pair => ({
    horse_number_1: pair.horse_number_1,
    horse_number_2: pair.horse_number_2,
    odds: pair.actualOdds
  }));

  const placeQuinellaOdds = preprocessedData.placeQPairs.map(pair => ({
    horse_number_1: pair.horse_number_1,
    horse_number_2: pair.horse_number_2,
    odds: pair.actualOdds
  }));

  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const horseA = contenders[i];
      const horseB = contenders[j];

      // Quinella comparison using favorite as the common leg
      const qDominance = compareQuinellaDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        [favoriteHorseNumber],
        quinellaOdds
      );

      if (qDominance !== "0") {
        const dominant = qDominance === horseA.horseNumber ? horseA : horseB;
        const other = qDominance === horseA.horseNumber ? horseB : horseA;

        if (dominant.win > other.win) {
          addComparisonAlert(dominant, other, 'Quinella', alerts);
        }
      }

      // Place Quinella comparison
      const pqDominance = comparePQDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        [favoriteHorseNumber],
        placeQuinellaOdds
      );

      if (pqDominance !== "0") {
        const dominant = pqDominance === horseA.horseNumber ? horseA : horseB;
        const other = pqDominance === horseA.horseNumber ? horseB : horseA;

        if (dominant.win > other.win) {
          addComparisonAlert(dominant, other, 'PQ', alerts);
        }
      }
    }
  }
}

/**
 * Compares contenders among themselves using all horses as legs
 * @param {PreprocessedHorse[]} contenders - Array of contender horses
 * @param {PreprocessedRaceData} preprocessedData - Preprocessed race data
 * @param {AlertMessage[]} alerts - Array to store generated alerts
 */
function analyzeWithinGroup(contenders, preprocessedData, alerts) {
  const allHorseNumbers = preprocessedData.horses.map(h => h.horseNumber);

  // Prepare quinella odds in the expected format
  const quinellaOdds = preprocessedData.quinellaPairs.map(pair => ({
    horse_number_1: pair.horse_number_1,
    horse_number_2: pair.horse_number_2,
    odds: pair.actualOdds
  }));

  const placeQuinellaOdds = preprocessedData.placeQPairs.map(pair => ({
    horse_number_1: pair.horse_number_1,
    horse_number_2: pair.horse_number_2,
    odds: pair.actualOdds
  }));

  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const horseA = contenders[i];
      const horseB = contenders[j];

      const legs = allHorseNumbers.filter(n => n !== horseA.horseNumber && n !== horseB.horseNumber);

      // Quinella comparison
      const qDominance = compareQuinellaDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        legs,
        quinellaOdds
      );

      if (qDominance !== "0") {
        const dominant = qDominance === horseA.horseNumber ? horseA : horseB;
        const other = qDominance === horseA.horseNumber ? horseB : horseA;

        if (dominant.win > other.win) {
          addComparisonAlert(dominant, other, 'Quinella', alerts);
        }
      }

      // Place Quinella comparison
      const pqDominance = comparePQDominance(
        horseA.horseNumber,
        horseB.horseNumber,
        legs,
        placeQuinellaOdds
      );

      if (pqDominance !== "0") {
        const dominant = pqDominance === horseA.horseNumber ? horseA : horseB;
        const other = pqDominance === horseA.horseNumber ? horseB : horseA;

        if (dominant.win > other.win) {
          addComparisonAlert(dominant, other, 'PQ', alerts);
        }
      }
    }
  }
}

/**
 * Creates standardized comparison alert
 * @param {PreprocessedHorse} dominantHorse - The dominant horse
 * @param {PreprocessedHorse} otherHorse - The horse being compared against
 * @param {'Quinella'|'PQ'} comparisonType - Type of comparison (Quinella or Place Quinella)
 * @param {AlertMessage[]} alerts - Array to store generated alerts
 */
function addComparisonAlert(dominantHorse, otherHorse, comparisonType, alerts) {
  alerts.push(createAlert(
    150,
    dominantHorse.horseNumber,
    'Info',
    `${dominantHorse.horseNumber} ${dominantHorse.horseName} has suspicious ${comparisonType} wager as compared to ${otherHorse.horseNumber} ${otherHorse.horseName}`,
    20, // winScore
    20  // placeScore
  ));
}