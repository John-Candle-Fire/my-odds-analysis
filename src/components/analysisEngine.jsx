// src/utils/oddsAnalysis.js
export const analyzeRace = (data) => {
    const findings = [];
    const { winPlaceOdds, quinellaOdds } = data;
  
    // 1. Find favourite
    const favourite = [...winPlaceOdds].sort((a, b) => a.win - b.win)[0];
  
    // 2. Check place odds anomalies
    winPlaceOdds.forEach(horse => {
      if (horse.horse_number !== favourite.horse_number && 
          parseFloat(horse.place) < parseFloat(favourite.place)) {
        findings.push(
          `ALERT: Horse ${horse.horse_number} place odds (${horse.place}) ` +
          `lower than favourite (${favourite.place})`
        );
      }
    });
  
    // 3. Quinella checks with favourite
    const favouriteCombos = quinellaOdds.filter(q => 
      q.horse_number_1 === favourite.horse_number || 
      q.horse_number_2 === favourite.horse_number
    );
  
    // More analysis groups here...
    
    return findings;
  };