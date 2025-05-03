// src/utils/pqComparison.js
/**
 * Place Quinella comparison utilities
 * Mirror of quinellaComparison.js but using place quinella odds
 */

/** 
 * @typedef {import('./types.js').QuinellaPair} QuinellaPair
 */

/**
 * Determines dominant horse in first leg based on place quinella odds comparisons against second legs
 * @param {string} firstLegA - First horse in primary pair (e.g. "1")
 * @param {string} firstLegB - Second horse in primary pair (e.g. "2") 
 * @param {string[]} secondLegs - Array of horses to compare as second legs (e.g. ["4","7","12"])
 * @param {QuinellaPair[]} placeQuinellaOdds - All available place quinella pairs
 * @returns {string} - Dominant first leg horse number or "0" if tie
 */
export function comparePQDominance(firstLegA, firstLegB, secondLegs, placeQuinellaOdds) {
    let dominanceScore = 0;
  
    secondLegs.forEach(secondLeg => {
      if (secondLeg === firstLegA || secondLeg === firstLegB) return;
  
      const comboA = formatPQCombo(firstLegA, secondLeg);
      const comboB = formatPQCombo(firstLegB, secondLeg);
      
      const oddsA = getPQOdds(comboA, placeQuinellaOdds);
      const oddsB = getPQOdds(comboB, placeQuinellaOdds);
  
      if (oddsA && oddsB) {
        dominanceScore += oddsA.odds < oddsB.odds ? 1 : -1;
      }
    });
  
    return dominanceScore > 0 ? firstLegA 
         : dominanceScore < 0 ? firstLegB 
         : "0";
  }
  
  /** 
   * Formats consistent place quinella combo key (numerically ordered)
   * @param {string} horse1
   * @param {string} horse2
   * @returns {string}
   */
  function formatPQCombo(horse1, horse2) {
    return [horse1, horse2]
      .map(Number)
      .sort((a, b) => a - b)
      .join('-');
  }
  
  /**
   * Finds specific place quinella pair by pre-formatted combo key
   * @param {string} combo
   * @param {QuinellaPair[]} placeQuinellaOdds
   * @returns {QuinellaPair | undefined}
   */
  function getPQOdds(combo, placeQuinellaOdds) {
    const [num1, num2] = combo.split('-').map(Number);
    return placeQuinellaOdds.find(q => 
      Number(q.horse_number_1) === num1 && 
      Number(q.horse_number_2) === num2
    );
  }