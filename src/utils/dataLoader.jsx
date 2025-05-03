// src/utils/dataLoader.js
// v1.0.5 - Added numeric conversion for all odds and index fields
// v1.0.6 - Added lastWin, lastPosition fields and horseID support

const buildFilePath = (date, raceNumber, timestamp) => {
  return `${date}-${raceNumber}-odds_${timestamp}.json`;
};

const buildHorseInfoPath = (date, raceNumber) => {
  return `${date}-${raceNumber}.json`;
};

const toFixedNumber = (value, decimals = 1) => {
  const num = Number(value);
  return isNaN(num) ? 0 : parseFloat(num.toFixed(decimals));
};

export const loadRaceData = async (date, raceNumber, timestamp) => {
  try {
    // 1. Load odds data
    const fileName = buildFilePath(date, raceNumber, timestamp);
    const data = await import(`../data/${fileName}`);
    const oddsData = data.default.odds || [];

    // 2. Create odds lookup map (horseNumber as string)
    const oddsLookup = oddsData.reduce((map, horse) => {
      map[String(horse.horse_number)] = {
        win: toFixedNumber(horse.win),
        place: toFixedNumber(horse.place)
      };
      return map;
    }, {});

    // 3. Try to load horse info or create default structure
    let horseInfo;
    try {
      const horseInfoPath = buildHorseInfoPath(date, raceNumber);
      const loadedInfo = (await import(`../data/other/${horseInfoPath}`)).default;
      
      // Merge with odds data and handle new fields
      horseInfo = {
        "Race Date": date,
        "Race Number": String(raceNumber),
        "Horses": loadedInfo.Horses.map(horse => ({
          ...horse,
          "horseID": String(horse["horseID"] || ""), // New field
          "Horse Number": String(horse["Horse Number"]),
          "Win": toFixedNumber(oddsLookup[String(horse["Horse Number"])]?.win || 0),
          "Place": toFixedNumber(oddsLookup[String(horse["Horse Number"])]?.place || 0),
          "First Win Index": toFixedNumber(horse["First Win Index"] || 0),
          "Race Day Win Index": toFixedNumber(horse["Race Day Win Index"] || 0),
          "lastWin": toFixedNumber(horse["lastWin"] || 0, 0),
          "lastPosition": toFixedNumber(horse["lastPosition"] || 0, 0)
        }))
      };
    } catch (error) {
      console.log('No horse info found, creating default structure');
      
      // Create default structure using odds data
      horseInfo = {
        "Race Date": date,
        "Race Number": String(raceNumber),
        "Horses": oddsData.map(horse => ({
          "horseID": "", // Default empty string
          "Horse Number": String(horse.horse_number),
          "Horse Name": " ",
          "Weight": " ",
          "Trainer": " ",
          "Jockey": " ",
          "Post": " ",
          "First Win Index": 0,
          "Race Day Win Index": 0,
          "lastWin": 0,
          "lastPosition": 0,
          "Win": toFixedNumber(horse.win || 0),
          "Place": toFixedNumber(horse.place || 0)
        }))
      };
    }

    // 4. Return standardized structure
    return {
      odds: oddsData.map(horse => ({
        horseNumber: String(horse.horse_number),
        win: toFixedNumber(horse.win),
        place: toFixedNumber(horse.place)
      })),
      quinella_odds: (data.default.quinella_odds || []).map(item => ({
        horse_number_1: String(item.horse_number_1),
        horse_number_2: String(item.horse_number_2),
        odds: toFixedNumber(item.quinella_odds, 0)
      })),
      quinella_place_odds: (data.default.quinella_place_odds || []).map(item => ({
        horse_number_1: String(item.horse_number_1),
        horse_number_2: String(item.horse_number_2),
        odds: toFixedNumber(item.quinella_place_odds, 0)
      })),
      horseInfo,
      raceInfo: { 
        date,
        raceNumber: String(raceNumber),
        timestamp,
        url: data.default.url 
      }
    };

  } catch (error) {
    console.error('Load error:', error.message);
    return null;
  }
};

// Updated time-series loader (unchanged)
export const loadRaceTimeSeries = async (date, raceNumber) => {
  try {
    const context = require.context('../data', false, /\.json$/);
    const files = context.keys()
      .filter(file => file.includes(`${date}-${raceNumber}-odds_`))
      .sort();

    return await Promise.all(
      files.map(async (file) => {
        const data = await import(`../data/${file.replace('./', '')}`);
        const timestamp = file.split('_').slice(1).join('_').replace('.json', '');
        return {
          ...data.default,
          raceInfo: { date, raceNumber, timestamp }
        };
      })
    );
  } catch (error) {
    console.error("Time series error:", error);
    return [];
  }
};

// Helper remains unchanged
export const hasPlaceQuinella = (data) => {
  return data?.quinella_place_odds?.length > 0;
};