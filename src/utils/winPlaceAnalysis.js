// src/utils/winPlaceAnalysis.js
import { createAlert, addAlert } from './alertSystem';

/**
 * Analyzes Win-Place relationships within a horse group
 * @param {RaceHorse[]} groupHorses - Horses in the current odds group
 */
export const analyzeWinPlace = (groupHorses) => {
  // Handle single-horse group case
  if (groupHorses.length === 1) {
    if (groupHorses[0].win <= 20) {
      addAlert(createAlert(
        20, 
        groupHorses[0].horseNumber, 
        'Info', 
        'Only horse in group with reasonable odds', 
        5, 
        10
      ));
    }
    return;
  }

  // Compare all horse pairs in the group
  for (let i = 0; i < groupHorses.length; i++) {
    for (let j = i + 1; j < groupHorses.length; j++) {
      const horseA = groupHorses[i];
      const horseB = groupHorses[j];
      
      // Only compare if horseA has better (lower) win odds
      if (horseA.win < horseB.win) {
        if (horseA.place >= horseB.place) {
          // Horse A has better win odds but worse/same place odds
          addAlert(createAlert(20, horseA.horseNumber, 'Info', "Weak place odds", -5, -5));
          addAlert(createAlert(20, horseB.horseNumber, 'Info', "Strong place odds", 5, 5));
        } else {
          // Normal case: better win odds => better place odds
          addAlert(createAlert(20, horseA.horseNumber, 'Info', "Place odds normal", 5, 10));
        }
      }
    }
  }
};