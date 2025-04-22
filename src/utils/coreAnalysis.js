// src/utils/coreAnalysis.js
export const DEFAULT_GROUPS = [
    { name: "Group 1 (Win <=5)", range: [1, 5] },
    { name: "Group 2 (5 < Win ≤10)", range: [5, 10] },
    { name: "Group 3 (10 < Win ≤20)", range: [10, 20] },
    { name: "Group 4 (15 < Win ≤35)", range: [15, 35] },
    { name: "Group 5 (Win >30)", range: [30, Infinity] }
  ];
  
  // Add this missing export
  export const getHorsesInGroup = (horses, group) => {
    return horses.filter(horse => 
      horse.win > group.range[0] && 
      (group.range[1] === Infinity || horse.win <= group.range[1])
    );
  };