// src/utils/quinellaComparison.js
//!TYPES! 
/**
 * @typedef {import('./types.js').QuinellaPair} QuinellaPair
 */

/**
 * Determines dominant horse in first leg based on quinella odds comparisons against second legs
 * @param {string} firstLegA - First horse in primary pair (e.g. "1")
 * @param {string} firstLegB - Second horse in primary pair (e.g. "2") 
 * @param {string[]} secondLegs - Array of horses to compare as second legs (e.g. ["4","7","12"])
 * @param {QuinellaPair[]} quinellaOdds - All available quinella pairs
 * @returns {string | 0} - Dominant first leg horse number or 0 if tie
 */
export function compareQuinellaDominance(firstLegA, firstLegB, secondLegs, quinellaOdds) {
    let dominanceScore = 0;
  
    secondLegs.forEach(secondLeg => {
      if (secondLeg === firstLegA || secondLeg === firstLegB) return;
  
      const comboA = formatQuinellaCombo(firstLegA, secondLeg);
      const comboB = formatQuinellaCombo(firstLegB, secondLeg);
      
      const oddsA = getQuinellaOdds(comboA, quinellaOdds);
      const oddsB = getQuinellaOdds(comboB, quinellaOdds);
  
      if (oddsA && oddsB) {
        dominanceScore += oddsA.odds < oddsB.odds ? 1 : -1;
      }
    });
  
    return dominanceScore > 0 ? firstLegA 
         : dominanceScore < 0 ? firstLegB 
         : 0;
  }
  
  /** 
   * Formats consistent quinella combo key (numerically ordered)
   * @param {string} horse1
   * @param {string} horse2
   * @returns {string}
   */
  function formatQuinellaCombo(horse1, horse2) {
    return [horse1, horse2]
      .map(Number)
      .sort((a, b) => a - b)
      .join('-');
  }
  
  /**
   * Finds specific quinella pair by pre-formatted combo key
   * @param {string} combo
   * @param {QuinellaPair[]} quinellaOdds
   * @returns {QuinellaPair | undefined}
   */
  function getQuinellaOdds(combo, quinellaOdds) {
    const [num1, num2] = combo.split('-').map(Number);
    return quinellaOdds.find(q => 
      Number(q.horse_number_1) === num1 && 
      Number(q.horse_number_2) === num2
    );
  }