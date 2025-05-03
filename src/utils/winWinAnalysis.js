// src/utils/winWinAnalysis.js
/** 
 * @typedef {import('./types.js').AlertMessage} AlertMessage 
 * @typedef {import('./types.js').RaceData} RaceData 
 * @typedef {import('./types.js').HorseDetail} HorseDetail 
 * @typedef {import('./types.js').GroupDefinition} GroupDefinition 
 */

import { createAlert, addAlert } from './alertSystem';
import { getHorsesInGroup } from './coreAnalysis';
import { DEFAULT_GROUPS } from './coreAnalysis';
import { compareQuinellaDominance } from './quinellaComparison.js';
import { analyzeContenders } from './contenderAnalysis';

/**
 * Analyzes comprehensive win-win factors for horses
 * @param {RaceData} raceData 
 * @param {GroupDefinition[]} [groups=DEFAULT_GROUPS] 
 */
export const analyzeWinWin = (raceData, groups = DEFAULT_GROUPS) => {
    if (!raceData?.odds?.length) return;

    // Get favourite group (Group 1: 1 < win <=5)
    const favouriteGroup = groups.find(g => g.category === "Favourites");
    if (!favouriteGroup) return;

    const horsesInFavGroup = getHorsesInGroup(raceData.odds, favouriteGroup);
    const allHorses = raceData.horseInfo?.Horses || [];

    // Variables to track favorite status for contender analysis
    let isOnlyFavourite = horsesInFavGroup.length === 1;
    let favouriteHorseNumbers = [];
    let anyBeatIndex = false;

    horsesInFavGroup.forEach(horse => {
        const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
        if (!horseDetail) return;

        // 1. Check if only favourite (already set)
        createWinWinAlert(horse.horseNumber, 'isOnlyFavourite', isOnlyFavourite);

        // 2. Check vs Race Day Win Index
        const isBeatIndex = horse.win < (horseDetail['Race Day Win Index'] || Infinity);
        createWinWinAlert(horse.horseNumber, 'isBeatIndex', isBeatIndex);

        // Track favorite horse details
        favouriteHorseNumbers.push(horse.horseNumber);
        if (isBeatIndex) anyBeatIndex = true;

        // 3. Check confidence vs last win
        const isMoreConfidence = horse.win < (horseDetail.lastWin || Infinity);
        createWinWinAlert(horse.horseNumber, 'isMoreConfidence', isMoreConfidence);

        // 4. Check last position
        const isGoodResult = isMoreConfidence && [2,3,4].includes(horseDetail.lastPosition || 0);
        createWinWinAlert(horse.horseNumber, 'isGoodResult', isGoodResult);

        // 5. Quinella comparison
        const quinellaLegs = Array.from(
            new Set(
                raceData.quinella_odds?.flatMap(q => [q.horse_number_1, q.horse_number_2]) || []
            )
        ).filter(leg => !horsesInFavGroup.some(h => h.horseNumber === leg));
  
        const comparisonGroup = horsesInFavGroup.length > 1 
            ? horsesInFavGroup 
            : [...horsesInFavGroup, ...getSecondLowestWinHorse(raceData.odds)];
  
        const qBanker = checkQuinellaBanker(
            comparisonGroup,
            quinellaLegs,
            raceData.quinella_odds
        );
  
        const isQBanker = qBanker === horse.horseNumber;
        createWinWinAlert(horse.horseNumber, 'isQBanker', isQBanker);

        // Create comprehensive message
        const messageParts = [
            `Horse ${horse.horseNumber} ${horseDetail['Horse Name']}`,
            `Group: ${favouriteGroup.category}`,
            `OnlyFavourite: ${isOnlyFavourite}`,
            `BeatIndex: ${isBeatIndex}`,
            `MoreConfidence: ${isMoreConfidence}`,
            `GoodResult: ${isGoodResult}`,
            `QBanker: ${isQBanker}`
        ];

        addAlert(createAlert(
            20,
            horse.horseNumber,
            'Analyze',
            messageParts.join(' | '),
            40,
            20,
            'Generic'
        ));
    });

    // Add banker recommendation alerts for all favorites
    horsesInFavGroup.forEach(horse => {
        const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
        if (!horseDetail) return;

        const isBeatIndex = horse.win < (horseDetail['Race Day Win Index'] || Infinity);

        if (isOnlyFavourite) {
            if (isBeatIndex) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 可以做胆`,
                    40,
                    20
                ));
            } else {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 不可以做胆`,
                    -10,
                    -5
                ));
            }
        } else {
            if (isBeatIndex) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 有對手，做腳`,
                    20,
                    15
                ));
            } else {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 缺乏信心`,
                    -20,
                    -10
                ));
            }
        }
    });

    // Run Contenders analysis after processing favorites and banker recommendations
    if (raceData.odds.length > 1) {
        const contenderAlerts = analyzeContenders(
            raceData,
            isOnlyFavourite,
            anyBeatIndex,
            isOnlyFavourite ? favouriteHorseNumbers[0] : null
        );
        contenderAlerts.forEach(alert => addAlert(alert));
    }
};

/**
 * Creates standardized win-win alert
 * @param {string} horseNumber 
 * @param {string} metricName 
 * @param {boolean} value 
 */
const createWinWinAlert = (horseNumber, metricName, value) => {
    addAlert(createAlert(
        20,
        horseNumber,
        'Info',
        `${metricName}: ${value.toString()}`,
        20,
        0,
        'Generic'
    ));
};

/**
 * Determines the dominant horse based on quinella comparisons
 * @param {RaceHorse[]} targetHorseGroup - Horses to compare (must have >= 2 horses)
 * @param {string[]} quinellaLegs - Common legs for comparison
 * @param {QuinellaPair[]} quinellaOdds - All quinella pairs
 * @returns {string} - Winning horse number or "0" if no clear winner
 */
const checkQuinellaBanker = (
    targetHorseGroup,
    quinellaLegs,
    quinellaOdds
) => {
    const winCounts = new Map();
    
    // Initialize counts for all horses in group
    targetHorseGroup.forEach((horse) => {
        winCounts.set(horse.horseNumber, 0);
    });

    // Compare all unique pairs
    for (let i = 0; i < targetHorseGroup.length; i++) {
        for (let j = i + 1; j < targetHorseGroup.length; j++) {
            const horseA = targetHorseGroup[i];
            const horseB = targetHorseGroup[j];
            
            const winner = compareQuinellaDominance(
                horseA.horseNumber,
                horseB.horseNumber,
                quinellaLegs,
                quinellaOdds
            );

            if (winner !== "0") {
                winCounts.set(winner, (winCounts.get(winner) || 0) + 1);
            }
        }
    }

    // Find horse with max wins
    let maxCount = 0;
    let dominantHorse = "0";
    let tie = false;

    winCounts.forEach((count, horseNumber) => {
        if (count > maxCount) {
            maxCount = count;
            dominantHorse = horseNumber;
            tie = false;
        } else if (count === maxCount) {
            tie = true;
        }
    });

    return tie ? "0" : dominantHorse;
};

/**
 * Gets second lowest win odds horse (for only favourite comparison)
 * @param {RaceHorse[]} horses 
 * @returns {RaceHorse[]}
 */
const getSecondLowestWinHorse = (horses) => {
    const sorted = [...horses].sort((a, b) => a.win - b.win);
    return sorted.length > 1 ? [sorted[1]] : [];
};