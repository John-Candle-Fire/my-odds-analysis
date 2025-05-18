// src/utils/coreAnalysis.js
export const DEFAULT_GROUPS = [
  { name: "Group 1 (Win <=5)", range: [1, 5], category: "Favourites" },
  { name: "Group 2 (5 < Win ≤10)", range: [5, 10], category: "Contenders" },
  { name: "Group 3 (10 < Win ≤20)", range: [10, 20], category: "LongShots" },
  { name: "Group 4 (15 < Win ≤35)", range: [15, 35], category: "VLongShots" },
  { name: "Group 5 (Win >30)", range: [30, Infinity], category: "Outsiders" }
];

/**
* Gets horses within a specific win odds range and includes group category
* @param {RaceHorse[]} horses - Array of race horses
* @param {GroupConfig} group - Group configuration with range and category
* @returns {Array<RaceHorse & {category: GroupCategory}>} Horses with added category property
*/
export const getHorsesInGroup = (horses, group) => {
  return horses
      .filter(horse => 
          horse.win > group.range[0] && 
          (group.range[1] === Infinity || horse.win <= group.range[1])
      )
      .map(horse => ({
          ...horse,
          category: group.category
      }));
};

/**
 * Determines the category based on win odds
 * @param {number} winOdds - The win odds of the horse
 * @returns {string} - The category string
 * returns first grroup that matches the odds since the groups overlapped
 */
export function getCategoryFromWinOdds(winOdds) {
  const group = DEFAULT_GROUPS.find(group => 
    winOdds > group.range[0] && 
    (group.range[1] === Infinity || winOdds <= group.range[1])
  );
  return group ? group.category : 'Unknown';
}