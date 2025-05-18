// src/utils/dataPreprocessor.js
import { findWinFavoriteX, findPlaceFavoriteX, findQuinellaFavoriteX, findPQFavoriteX } from './favorites';
import { getCategoryFromWinOdds } from './coreAnalysis';

/**
 * Determines if two odds values fall within the same boundary range
 * @param {number} odds1 - First odds value to compare
 * @param {number} odds2 - Second odds value to compare
 * @returns {boolean} True if both odds fall within the same range
 */
const isSameRange = (odds1, odds2) => {
    // Define the win boundaries - easily modifiable
    const boundaries = [
      [1, 3],    // [1-3]
      [3, 5],    // [3-5]
      [5, 7],    // [5-7]
      [7, 10],   // [7-10]
      [10, 15],  // [10-15]
      [15, 20],  // [15-20]
      [20, 30],  // [20-30]
      [30, 60],  // [30-60]
      [60, 999]  // [60-999]
    ];
  
    // Find which range each odds falls into
    const getRangeIndex = (odds) => {
      return boundaries.findIndex(([min, max]) => odds >= min && odds <= max);
    };
  
    return getRangeIndex(odds1) === getRangeIndex(odds2);
  };
  

/**
 * Preprocesses raw race data into a flat structure for analysis
 * @param {Object} raceData - The raw race data
 * @returns {PreprocessedRaceData} - The preprocessed race data
 */
export function preprocessRaceData(raceData) {
    if (!raceData?.odds?.length) {
        throw new Error('Invalid race data: No odds available');
    }

    // Step 1: Identify favorites
    const winFavourites = findWinFavoriteX(raceData.odds);
    const placeFavourites = findPlaceFavoriteX(raceData.odds);
    const qFavouritePairs = findQuinellaFavoriteX(raceData.quinella_odds);
    const pqFavouritePairs = findPQFavoriteX(raceData.quinella_place_odds);

    // Step 2: Preprocess horses
    const horses = raceData.odds.map((horse) => {
        const horseDetail = raceData.horseInfo.Horses.find(h => h['Horse Number'] === horse.horseNumber) || {};
        const isNewHorse = horseDetail.lastWin === 0;
        const isBeatIndex = horse.win <= (horseDetail['Race Day Win Index'] || Infinity);
        const lastGoodResult = [1, 2, 3, 4].includes(horseDetail.lastPosition);
        const sameWinRange = isSameRange(horse.win, horseDetail.lastWin);
        const category = getCategoryFromWinOdds(horse.win);

        return {
            horseNumber: horse.horseNumber,
            horseName: horseDetail['Horse Name'] || 'Unknown',
            trainer: horseDetail.Trainer || 'Unknown',
            jockey: horseDetail.Jockey || 'Unknown',
            weight: horseDetail.Weight || '0',
            firstDayIndex: horseDetail['First Day Index'] || 0,
            raceDayIndex: horseDetail['Race Day Win Index'] || 0,
            lastWin: horseDetail.lastWin || 0,
            lastPosition: horseDetail.lastPosition || 0,
            win: horse.win,
            place: horse.place,
            expectedP: calculateExpectedP(horse.win), 
            category,
            isNewHorse,
            isBeatIndex,
            lastGoodResult,
            sameWinRange,
            isWinFavorite: winFavourites.includes(horse.horseNumber),
            isPlaceFavorite: placeFavourites.includes(horse.horseNumber),
            isQFavourite: qFavouritePairs.some(pair => pair.includes(horse.horseNumber)),
            isPQFavourite: pqFavouritePairs.some(pair => pair.includes(horse.horseNumber)),
        };
    });

    // Step 3: Preprocess quinella pairs
    const quinellaPairs = raceData.quinella_odds.map((pair) => {
        const STANDARD_ERROR = 23.68;
        const win1 = horses.find(h => h.horseNumber === pair.horse_number_1)?.win || 0;
        const win2 = horses.find(h => h.horseNumber === pair.horse_number_2)?.win || 0;
        const expectedOdds = calculateExpectedQuinella(win1, win2); // Placeholder: Add your regression logic
        const residual = expectedOdds - pair.odds;
        const standardizedResidual = residual / STANDARD_ERROR;

        return {
            horse_number_1: pair.horse_number_1,
            horse_number_2: pair.horse_number_2,
            actualOdds: pair.odds,
            expectedOdds,
            residual,
            
        };
    });    
        
    // Step 4: Preprocess place quinella pairs
    const placeQPairs = raceData.quinella_place_odds && raceData.quinella_place_odds.length > 0
    ? raceData.quinella_place_odds.map((pair) => {
        const STANDARD_ERROR = 23.68;
        const win1 = horses.find(h => h.horseNumber === pair.horse_number_1)?.win || 0;
        const win2 = horses.find(h => h.horseNumber === pair.horse_number_2)?.win || 0;
        const expectedOdds = fairPQoddsHK(win1, win2);
        const residual = expectedOdds - pair.odds;
        

        return {
            horse_number_1: pair.horse_number_1,
            horse_number_2: pair.horse_number_2,
            actualOdds: pair.odds,
            expectedOdds,
            residual,
        };
    })
    : [];


    // Step 5: Return preprocessed data
    const result = {
        horses,
        quinellaPairs,
        placeQPairs,
        winFavourite: winFavourites[0] || null,
        placeFavourite: placeFavourites[0] || null,
        qFavouritePair: qFavouritePairs[0] || [],
        pqFavouritePair: pqFavouritePairs[0] || [],
    };
    printPreprocessedData(result);
    return result;
}

// use linear regression to calculate expected place odds
// Expected P = 0.9458 + (0.1923 * Win Odds)
function calculateExpectedP(winOdds) {
    const expectedQOdds = 0.9458 + (0.1923 * winOdds);
    return expectedQOdds; 
}

// use linear regression to calculate expected quinella odds
// Expected Q = 6.44 + (0.415 * Win1 * Win2)
function calculateExpectedQuinella(win1, win2) {
    const winProduct = win1 * win2;
    const expectedQOdds = 6.44 + (0.415 * winProduct);
    return expectedQOdds; 
}

function fairPQoddsHK(hkOddsA, hkOddsB, gamma = 0.88, takeout = 0.20) {
    // Convert HK odds to decimal and probabilities
    const decimalA = hkOddsA + 1;
    const decimalB = hkOddsB + 1;
    const pA = 1 / decimalA;
    const pB = 1 / decimalB;

    // Approximate top-3 probabilities (simplified)
    const pATop3 = 1 - Math.pow(1 - pA, 3);
    const pBTop3 = 1 - Math.pow(1 - pB, 3);

    // Conditional probability (Stern-adjusted)
    const pBGivenA = 1 - Math.pow(1 - (pB / (1 - pA)), 2);
    const pAGivenB = 1 - Math.pow(1 - (pA / (1 - pB)), 2);

    // QP probability (symmetrized)
    const qpProb = 0.5 * (pATop3 * pBGivenA + pBTop3 * pAGivenB);

    // Fair odds after takeout
    return (1 - takeout) / qpProb;
}

/**
 * Prints the contents of PreprocessedRaceData for verification
 * @param {PreprocessedRaceData} data - The preprocessed race data
 */
export function printPreprocessedData(data) {
    console.log('=== PreprocessedRaceData Contents ===');

    // Print top-level fields
    console.log('Win Favourite:', data.winFavourite || 'None');
    console.log('Place Favourite:', data.placeFavourite || 'None');
    console.log('Quinella Favourite Pair:', data.qFavouritePair.length ? data.qFavouritePair.join('-') : 'None');
    console.log('Place Quinella Favourite Pair:', data.pqFavouritePair.length ? data.pqFavouritePair.join('-') : 'None');

    // Print horses
    console.log('\nHorses:');
    data.horses.forEach((horse, index) => {
        console.log(`Horse ${index + 1}:`);
        console.log(`  Number: ${horse.horseNumber}`);
        console.log(`  Name: ${horse.horseName}`);
        console.log(`  Trainer: ${horse.trainer}`);
        console.log(`  Jockey: ${horse.jockey}`);
        console.log(`  Weight: ${horse.weight}`);
        console.log(`  Race Day Index: ${horse.raceDayIndex}`);
        console.log(`  Win Odds: ${horse.win}`);
        console.log(`  Place Odds: ${horse.place}`);
        console.log(`  Expected Place: ${horse.expectedP}`);
        console.log(`  Category: ${horse.category}`);
        console.log(`  Is New Horse: ${horse.isNewHorse}`);
        console.log(`  Is Beat Index: ${horse.isBeatIndex}`);
        console.log(`  Last Good Result: ${horse.lastGoodResult}`);
        console.log(`  Same Win Range: ${horse.sameWinRange}`);
        console.log(`  Is Win Favorite: ${horse.isWinFavorite}`);
        console.log(`  Is Place Favorite: ${horse.isPlaceFavorite}`);
        console.log(`  Is Quinella Favorite: ${horse.isQFavourite}`);
        console.log(`  Is Place Quinella Favorite: ${horse.isPQFavourite}`);
    });

    // Print quinella pairs
    console.log('\nQuinella Pairs:');
    data.quinellaPairs.forEach((pair, index) => {
        console.log(`Pair ${index + 1}:`);
        console.log(`  Horses: ${pair.horse_number_1}-${pair.horse_number_2}`);
        console.log(`  Actual Odds: ${pair.actualOdds}`);
        console.log(`  Expected Odds: ${pair.expectedOdds}`);
        console.log(`  Residual: ${pair.residual}`);
        
    });
    
    // Print place quinella pairs in printPreprocessedData
    console.log('\nPlace Quinella Pairs:');
    if (data.placeQPairs.length > 0) {
        data.placeQPairs.forEach((pair, index) => {
            console.log(`Pair ${index + 1}:`);
            console.log(`  Horses: ${pair.horse_number_1}-${pair.horse_number_2}`);
            console.log(`  Actual Odds: ${pair.actualOdds}`);
            console.log(`  Expected Odds: ${pair.expectedOdds}`);
            console.log(`  Residual: ${pair.residual}`);
        });
    } else {
        console.log('  No Place Quinella Pairs available');
    }

    console.log('====================================');
}