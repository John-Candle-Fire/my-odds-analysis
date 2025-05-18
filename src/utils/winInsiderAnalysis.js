// src/utils/winInsiderAnalysis.js
import { createAlert, addAlert } from './alertSystem.js';

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
 * @param {Array<import('./types.js').PreprocessedHorse>} groupHorses - Horses in current analysis group
 */
export const analyzeWinRaceDayIndex = (groupHorses) => {
  for (const horse of groupHorses) {
    if (horse.raceDayIndex === undefined) continue;

    // Extract values with defaults
    const winIndex = horse.raceDayIndex || 0;
    const winOdds = horse.win || 0;
    const lastWin = horse.lastWin || 0;
    const lastPosition = horse.lastPosition || 0;
    const horseName = horse.horseName || 'Unknown';
    const isUnexpected = winOdds <= 15 && winIndex >= 40;
    const isNewHorse = lastWin === 0;

    // Only proceed if current odds are lower than expected index
    if (winOdds < winIndex) {
      const percentageDiff = ((winIndex - winOdds) / winIndex) * 100;
      const formattedPct = percentageDiff.toFixed(2) + '%';

      // Check if last position was good (1-4)
      const lastGoodResult = lastPosition >= 1 && lastPosition <= 4;
      const sameWinRange = isSameRange(winOdds, lastWin);

      const baseMessage = `${horse.horseNumber} ${horseName}: Current odds ${winOdds} vs expected ${winIndex} (${formattedPct}). Last race: ${lastWin} odds, finished ${lastPosition}`;

      // Handle unexpected case first
      if (isUnexpected) {
        addAlert(createAlert(170, horse.horseNumber, 'Info', 
          `賠率異常熱 - ${baseMessage} 如果臨場賠率相若 可WQ胆 反之放棄`, 50, 60));
        continue;
      }

      // Then handle other cases
      if (winOdds <= 25) {
        if (isNewHorse) {
          addAlert(createAlert(160, horse.horseNumber, 'Info', 
            `初出馬 - ${baseMessage}`, 15, 25));
        } else if (winOdds <= lastWin) {
          if (lastGoodResult) {
            let alertMessage;
            if (winOdds <= 11) {
              alertMessage = `賽績支持(38%Q) - ${baseMessage}`;
            } else if (winOdds <= 18) {
              alertMessage = `賽績支持(冷腳) - ${baseMessage}`;
            } else {
              alertMessage = `賽績支持 - ${baseMessage}`;
            }
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              alertMessage, 20, 40));
          } else {
            let alertMessage;
            if (winOdds <= 11) {
              alertMessage = `賠率比上次熱(40%三甲) - 上次跑第${lastPosition} - ${baseMessage}`;
            } else {
              alertMessage = `賠率比上次熱(18%三甲) - 上次跑第${lastPosition} - ${baseMessage}`;
            }
            addAlert(createAlert(160, horse.horseNumber, 'Info', 
              alertMessage, 15, 30));
          }
        } else if (sameWinRange) {
          if (winOdds <= 11) {
            addAlert(createAlert(170, horse.horseNumber, 'Info', 
              `賠率上次相若(60%Q胆) - 上次跑第${lastPosition}  - ${baseMessage}`, 10, 20));
          }
        } else {
          let alertMessage;
          if (winOdds <= 11 && horse.place <= horse.expectedP) {
            alertMessage = `賠率比上次冷(四重彩三四位) - ${baseMessage}`;
          } else {
            alertMessage = `賠率比上次冷(20%三甲) - ${baseMessage}`;
          }
          addAlert(createAlert(160, horse.horseNumber, 'Info', 
            alertMessage, 5, 15));
        }
      } else {
        // Only add alert if winOdds is between 29 and 61
        if (winOdds >= 29 && winOdds <= 61) {
          addAlert(createAlert(160, horse.horseNumber, 'Info', 
            `獨贏冇飛但比預期好 - ${baseMessage}`, -10, 0));
        }
      }
    } else if (winOdds < 99) {
      const baseMessage = `${horse.horseNumber} ${horseName}: Current odds ${winOdds} (not better than expected ${winIndex})`;
      const logDiff = Math.log(winOdds) - Math.log(winIndex);
      let alertMessage;
      if (winOdds > 1 && winOdds <= 5 && logDiff <= 0.31) {
        alertMessage = `50%三甲機會 - ${baseMessage}`;
      } else if (winOdds > 5 && winOdds <= 10 && logDiff <= 0.31) {
        alertMessage = `30%三甲機會 - ${baseMessage}`;
      } else if (winOdds > 10 && winOdds <= 30) {
        alertMessage = `20%三甲機會 - ${baseMessage}`;
      } else {
        alertMessage = `Win飛不及預期 - ${baseMessage}`;
      }
      addAlert(createAlert(155, horse.horseNumber, 'Info', 
        alertMessage, -10, 0));
    }
  }
};