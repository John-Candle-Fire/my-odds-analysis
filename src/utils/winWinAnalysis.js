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
 * @param {PreprocessedRaceData} preprocessedData 
 */
export const analyzeWinWinX = (preprocessedData) => {
    const favouriteGroup = DEFAULT_GROUPS.find(g => g.category === "Favourites");
    if (!favouriteGroup) return;

    const horsesInFavGroup = preprocessedData.horses.filter(horse => horse.category === "Favourites");

    let isOnlyFavourite = horsesInFavGroup.length === 1;
    let multiFavourite = false;
    if (!isOnlyFavourite) {
        const beatIndexCount = horsesInFavGroup.filter(horse => horse.isBeatIndex).length;
        if (beatIndexCount > 1) {
            multiFavourite = true;
        }
    }
    let favouriteHorseNumbers = horsesInFavGroup.map(h => h.horseNumber);
    let anyBeatIndex = horsesInFavGroup.some(h => h.isBeatIndex);
    let newHorseAlertAdded = false;

    // First pass: Analyze individual favorite horses
    horsesInFavGroup.forEach(horse => {
        const isNewHorse = horse.isNewHorse;
        const isBeatIndex = horse.isBeatIndex;
        const isMoreConfidence = horse.win <= horse.lastWin;
        const isGoodResult = isMoreConfidence && [2, 3, 4].includes(horse.lastPosition);
        const isUnexpected = horse.win <= 15 && horse.raceDayIndex >= 40;

        // Create individual metric alerts
        createWinWinAlert(horse.horseNumber, 'isOnlyFavourite', isOnlyFavourite);
        createWinWinAlert(horse.horseNumber, 'isBeatIndex', isBeatIndex);
        createWinWinAlert(horse.horseNumber, 'isMoreConfidence', isMoreConfidence);
        createWinWinAlert(horse.horseNumber, 'isGoodResult', isGoodResult);
        createWinWinAlert(horse.horseNumber, 'isUnexpected', isUnexpected);
        createWinWinAlert(horse.horseNumber, 'isNewHorse', isNewHorse);

        // Quinella analysis
        const allQuinellaHorses = new Set(
            preprocessedData.quinellaPairs.flatMap(pair => [pair.horse_number_1, pair.horse_number_2])
        );
        const quinellaLegs = Array.from(allQuinellaHorses).filter(
            leg => !horsesInFavGroup.some(h => h.horseNumber === leg)
        );

        const comparisonGroup = horsesInFavGroup.length > 1
            ? horsesInFavGroup
            : [...horsesInFavGroup, ...getSecondLowestWinHorse(preprocessedData.horses)];

        const qBanker = checkQuinellaBanker(
            comparisonGroup,
            quinellaLegs,
            preprocessedData.quinellaPairs
        );

        const isQBanker = qBanker === horse.horseNumber;
        createWinWinAlert(horse.horseNumber, 'isQBanker', isQBanker);

        // Comprehensive alert
        const messageParts = [
            `Horse ${horse.horseNumber} ${horse.horseName}`,
            `Group: Favourites`,
            `OnlyFavourite: ${isOnlyFavourite}`,
            `BeatIndex: ${isBeatIndex}`,
            `MoreConfidence: ${isMoreConfidence}`,
            `GoodResult: ${isGoodResult}`,
            `Unexpected: ${isUnexpected}`,
            `NewHorse: ${isNewHorse}`,
            `QBanker: ${isQBanker}`
        ];

        let priority = isUnexpected ? 50 : (isOnlyFavourite && isBeatIndex) ? 40 : isQBanker ? 30 : 20;
        let subPriority = isUnexpected ? 60 : (isOnlyFavourite && isBeatIndex) ? 50 : isQBanker ? 40 : 30;

        addAlert(createAlert(
            20,
            horse.horseNumber,
            isUnexpected ? 'Warning' : 'Analyze',
            messageParts.join(' | '),
            priority,
            subPriority,
            'Generic'
        ));

        if (isNewHorse && ((isOnlyFavourite && (isUnexpected || isBeatIndex)) || (!isOnlyFavourite && isUnexpected))) {
            newHorseAlertAdded = true;
            addAlert(createAlert(
                160,
                horse.horseNumber,
                'Analyze',
                `初出熱門馬 - ${horse.horseNumber} ${horse.horseName} ，做腳`,
                priority + 10,
                subPriority + 10
            ));
        }
    });

    // Second pass: Banker recommendations
    horsesInFavGroup.forEach(horse => {
        const isNewHorse = horse.isNewHorse;
        const isBeatIndex = horse.isBeatIndex;
        const isUnexpected = horse.win <= 15 && horse.raceDayIndex >= 40;

        if (isNewHorse && newHorseAlertAdded) return;

        if (isOnlyFavourite) {
            if (isUnexpected) {
                if (horse.place <= horse.expectedP) {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Analyze',
                        `異常落飛，可以做胆 - ${horse.horseNumber} ${horse.horseName} (Place: ${horse.place} <= Expected: ${horse.expectedP})`,
                        60,
                        70
                    ));
                } else {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Analyze',
                        `異常落飛，可以做胆 - ${horse.horseNumber} ${horse.horseName} (Place: ${horse.place} > Expected: ${horse.expectedP})`,
                        60,
                        70
                    ));
                }
            } else if (isBeatIndex) {
                addAlert(createAlert(
                    170,
                    horse.horseNumber,
                    'Analyze',
                    `可以做胆 - ${horse.horseNumber} ${horse.horseName} 唯一 5 倍下的有飛馬`,
                    40,
                    50
                ));
            } else {
                addAlert(createAlert(
                    165,
                    horse.horseNumber,
                    'Analyze',
                    `熱門腳 - ${horse.horseNumber} ${horse.horseName}  唯一 5 倍下的馬`,
                    -10,
                    -5
                ));
            }
        } else {
            if (isUnexpected) {
                if (horse.place <= horse.expectedP) {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Warning',
                        `異常落飛，優先考慮 - ${horse.horseNumber} ${horse.horseName} (Place: ${horse.place} <= Expected: ${horse.expectedP})`,
                        50,
                        60
                    ));
                } else {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Warning',
                        `異常落飛，優先考慮 - ${horse.horseNumber} ${horse.horseName} (Place: ${horse.place} > Expected: ${horse.expectedP})`,
                        50,
                        60
                    ));
                }
            } else if (isBeatIndex) {
                if (multiFavourite) {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Analyze',
                        `有對手，做腳 - ${horse.horseNumber} ${horse.horseName}`,
                        30,
                        40
                    ));
                } else {
                    addAlert(createAlert(
                        165,
                        horse.horseNumber,
                        'Analyze',
                        `雖有對手，仍然可做胆 - ${horse.horseNumber} ${horse.horseName}`,
                        30,
                        40
                    ));
                }
            } else {
                if (horse.win > 0 && horse.raceDayIndex > 0 && Math.log(horse.win) - Math.log(horse.raceDayIndex) <= 0.3) {
                    addAlert(createAlert(
                        165,
                        horse.horseNumber,
                        'Analyze',
                        `可接受 - ${horse.horseNumber} ${horse.horseName} 約一半機會三甲`,
                        -20,
                        -10
                    ));
                } else {
                    addAlert(createAlert(
                        160,
                        horse.horseNumber,
                        'Analyze',
                        `缺乏信心 - ${horse.horseNumber} ${horse.horseName} 可放棄`,
                        -20,
                        -10
                    ));
                }
            }
        }
    });

    // Contender analysis (using original raceData for now)
    if (preprocessedData.horses.length > 1) {
        const contenderAlerts = analyzeContenders(
            preprocessedData,
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