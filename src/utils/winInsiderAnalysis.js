// src/utils/winInsiderAnalysis.js
import { createAlert, addAlert } from './alertSystem';

/**
 * Analyzes win odds against Race Day Win Index to detect insider patterns
 * @param {Array<{horseNumber: string, win: number}>} groupHorses - Horses in current analysis group
 * @param {Array<{'Horse Number': string, 'Race Day Win Index': number}>} allHorses - All race horses with details
 */
export const analyzeWinRaceDayIndex = (groupHorses, allHorses) => {
  for (const horse of groupHorses) {
    const horseDetail = allHorses.find(h => h['Horse Number'] === horse.horseNumber);
    
    if (!horseDetail || horseDetail['Race Day Win Index'] === undefined) continue;

    const winIndex = horseDetail['Race Day Win Index'];
    const winOdds = horse.win;
    
    if (winOdds < winIndex) {
      const percentageDiff = ((winIndex - winOdds) / winIndex) * 100;
      const formattedPct = percentageDiff.toFixed(2) + '%';
      
      if (winOdds <= 25) {
        if (percentageDiff >= 40) {
          addAlert(createAlert(130, horse.horseNumber, 'Info', 
            `suspicious insider bets ${formattedPct}`, 20, 40));
        } else if (percentageDiff >= 20) {
          addAlert(createAlert(130, horse.horseNumber, 'Info', 
            `suspicious insider bets ${formattedPct}`, 10, 20));
        } else if (percentageDiff >= 10) {
          addAlert(createAlert(120, horse.horseNumber, 'Info', 
            `suspicious insider bets ${formattedPct}`, 5, 10));
        } else {
          addAlert(createAlert(20, horse.horseNumber, 'Info', 
            `normal (${formattedPct})`, 0, 5));
        }
      }
    } else if (winOdds < 20) {
      addAlert(createAlert(20, horse.horseNumber, 'Info', 
        'no insider bets', -10, 0));
    }
  }
};