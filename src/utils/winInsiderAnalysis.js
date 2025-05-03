// src/utils/winInsiderAnalysis.js
import { createAlert, addAlert } from './alertSystem';

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
 * Analyzes win odds against Race Day Win Index to detect insider patterns
 * @param {Array<Object>} groupHorses - Horses in current analysis group (RaceHorse type)
 * @param {Array<Object>} allHorses - All race horses with details (HorseDetail type)
 */
export const analyzeWinRaceDayIndex = (groupHorses, allHorses) => {
  for (const horse of groupHorses) {
    const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
    
    if (!horseDetail || horseDetail['Race Day Win Index'] === undefined) continue;

    // Extract values with defaults
    const winIndex = horseDetail['Race Day Win Index'] || 0;
    const winOdds = horse.win || 0;
    const lastWin = horseDetail['lastWin'] || 0;
    const lastPosition = horseDetail['lastPosition'] || 0;
    const horseName = horseDetail['Horse Name'] || 'Unknown';

    // Only proceed if current odds are lower than expected index
    if (winOdds < winIndex) {
      const percentageDiff = ((winIndex - winOdds) / winIndex) * 100;
      const formattedPct = percentageDiff.toFixed(2) + '%';

      // Check if last position was good (1-4)
      const lastGoodResult = lastPosition >= 1 && lastPosition <= 4;
      const sameWinRange = isSameRange(winOdds, lastWin);

      const baseMessage = `${horse.horseNumber} ${horseName}: Current odds ${winOdds} vs expected ${winIndex} (${formattedPct}). Last race: ${lastWin} odds, finished ${lastPosition}`;

      if (winOdds <= 25) {
        if (winOdds <= lastWin) {
          if (lastGoodResult) {
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              `賽績 - ${baseMessage}`, 20, 40));
          } else {
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              `比上次熱 - ${baseMessage}`, 15, 30));
          }
        } else {
          if (sameWinRange) {
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              `上賽相若 - ${baseMessage}`, 10, 20));
          } else {
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              `比上次冷 - ${baseMessage}`, 5, 15));
          }
        }
      } else {
        addAlert(createAlert(160, horse.horseNumber, 'Info', 
          `冷馬 - ${baseMessage}`, -10, 0));
      }
    } else if (winOdds < 99) {
      const baseMessage = `${horse.horseNumber} ${horseName}: Current odds ${winOdds} (not better than expected ${winIndex})`;
      addAlert(createAlert(155, horse.horseNumber, 'Info', 
        `Win飛不及預期 - ${baseMessage}`, -10, 0));
    }
  }
};