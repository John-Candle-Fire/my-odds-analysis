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
    let newHorseAlertAdded = false;

    // First pass: Analyze individual favorite horses
    horsesInFavGroup.forEach(horse => {
        const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
        if (!horseDetail) return;

        // Extract key metrics
        const isNewHorse = (horseDetail.lastWin || 0) === 0;
        const isBeatIndex = horse.win < (horseDetail['Race Day Win Index'] || Infinity);
        const isMoreConfidence = horse.win < (horseDetail.lastWin || Infinity);
        const isGoodResult = isMoreConfidence && [2,3,4].includes(horseDetail.lastPosition || 0);
        const isUnexpected = horse.win <= 15 && (horseDetail['Race Day Win Index'] || 0) >= 40;

        // Track favorite horse details
        favouriteHorseNumbers.push(horse.horseNumber);
        if (isBeatIndex) anyBeatIndex = true;

        // Create individual metric alerts
        createWinWinAlert(horse.horseNumber, 'isOnlyFavourite', isOnlyFavourite);
        createWinWinAlert(horse.horseNumber, 'isBeatIndex', isBeatIndex);
        createWinWinAlert(horse.horseNumber, 'isMoreConfidence', isMoreConfidence);
        createWinWinAlert(horse.horseNumber, 'isGoodResult', isGoodResult);
        createWinWinAlert(horse.horseNumber, 'isUnexpected', isUnexpected);
        createWinWinAlert(horse.horseNumber, 'isNewHorse', isNewHorse);

        // Quinella analysis
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

        // Create comprehensive message with priority based on conditions
        const messageParts = [
            `Horse ${horse.horseNumber} ${horseDetail['Horse Name']}`,
            `Group: ${favouriteGroup.category}`,
            `OnlyFavourite: ${isOnlyFavourite}`,
            `BeatIndex: ${isBeatIndex}`,
            `MoreConfidence: ${isMoreConfidence}`,
            `GoodResult: ${isGoodResult}`,
            `Unexpected: ${isUnexpected}`,
            `NewHorse: ${isNewHorse}`,
            `QBanker: ${isQBanker}`
        ];

        let priority, subPriority;
        if (isUnexpected) {
            priority = 50;
            subPriority = 60;
        } else if (isOnlyFavourite && isBeatIndex) {
            priority = 40;
            subPriority = 50;
        } else if (isQBanker) {
            priority = 30;
            subPriority = 40;
        } else {
            priority = 20;
            subPriority = 30;
        }

        addAlert(createAlert(
            20,
            horse.horseNumber,
            isUnexpected ? 'Warning' : 'Analyze',
            messageParts.join(' | '),
            priority,
            subPriority,
            'Generic'
        ));

        // Special handling for new horses that meet conditions
        if (isNewHorse && ((isOnlyFavourite && (isUnexpected || isBeatIndex)) || 
                          (!isOnlyFavourite && isUnexpected))) {
            newHorseAlertAdded = true;
            addAlert(createAlert(
                160,
                horse.horseNumber,
                'Analyze',
                `${horse.horseNumber} ${horseDetail['Horse Name']} 初出馬熱門，做腳`,
                priority + 10,  // Slightly higher than normal
                subPriority + 10
            ));
        }
    });

    // Second pass: Create banker recommendations with enhanced logic
    horsesInFavGroup.forEach(horse => {
        const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
        if (!horseDetail) return;

        const isNewHorse = (horseDetail.lastWin || 0) === 0;
        const isBeatIndex = horse.win < (horseDetail['Race Day Win Index'] || Infinity);
        const isUnexpected = horse.win <= 15 && (horseDetail['Race Day Win Index'] || 0) >= 40;

        // Skip special new horse message if already added in first pass
        if (isNewHorse && newHorseAlertAdded) {
            return;
        }

        if (isOnlyFavourite) {
            if (isUnexpected) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 異常落飛，可以做胆`,
                    60,
                    70
                ));
            } else if (isBeatIndex) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 可以做胆`,
                    40,
                    50
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
            if (isUnexpected) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Warning',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 異常落飛，優先考慮`,
                    50,
                    60
                ));
            } else if (isBeatIndex) {
                addAlert(createAlert(
                    160,
                    horse.horseNumber,
                    'Analyze',
                    `${horse.horseNumber} ${horseDetail['Horse Name']} 有對手，做腳`,
                    30,
                    40
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
 * @param {Array<Object>} targetHorseGroup - Horses to compare (must have >= 2 horses)
 * @param {string[]} quinellaLegs - Common legs for comparison
 * @param {Array<Object>} quinellaOdds - All quinella pairs
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
 * @param {Array<Object>} horses 
 * @returns {Array<Object>}
 */
const getSecondLowestWinHorse = (horses) => {
    const sorted = [...horses].sort((a, b) => a.win - b.win);
    return sorted.length > 1 ? [sorted[1]] : [];
};