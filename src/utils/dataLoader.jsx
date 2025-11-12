// src/utils/dataLoader.js

// v1.0.5 - Added numeric conversion for all odds and index fields

// v1.0.6 - Added lastWin, lastPosition fields and horseID support

// v1.0.7 - Added pace data loading

// v1.0.8 - Added prediction data loading (DBL, Q, QP)

const buildFilePath = (date, raceNumber, timestamp) => {
  return `${date}-${raceNumber}-odds_${timestamp}.json`;
};

const buildHorseInfoPath = (date, raceNumber) => {
  return `${date}-${raceNumber}.json`;
};

const buildPaceFilePath = (date, raceNumber) => {
  return `${date}-${raceNumber}-xy.json`;
};

const buildPredictionFilePath = (date, raceNumber, predictionType, timestamp) => {
  return `${date}-${raceNumber}-${predictionType}prediction_${timestamp}.json`;
};

const buildRTGFilePath = (date, raceNumber, predictionType) => {
  return `${date}-${raceNumber}-${predictionType}prediction.json`;
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
    const horseInfoPath = buildHorseInfoPath(date, raceNumber);

    try {
      console.log(`File path: ${horseInfoPath}`);
      const loadedInfo = (await import(`../data/other/${horseInfoPath}`)).default;

      // Merge with odds data and handle new fields
      horseInfo = {
        "Race Date": date,
        "Race Number": String(raceNumber),
        "Horses": loadedInfo.Horses.map(horse => ({
          ...horse,
          "horseID": String(horse["horseID"] || ""),
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
      console.log(`File path: ${horseInfoPath}`);
      console.error('Error details:', error);

      // Create default structure using odds data
      horseInfo = {
        "Race Date": date,
        "Race Number": String(raceNumber),
        "Horses": oddsData.map(horse => ({
          "horseID": "",
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

    // 4. Load pace data if available
    let paceData = null;
    try {
      const paceFileName = buildPaceFilePath(date, raceNumber);
      const paceModule = await import(`../data/pace/${paceFileName}`);
      paceData = {
        course: paceModule.default.course,
        date: paceModule.default.date,
        race_number: paceModule.default.race_number,
        class: paceModule.default.class,
        track: paceModule.default.track,
        distance: paceModule.default.distance,
        pace: paceModule.default.pace,
        positions: paceModule.default.Array.map(item => ({
          horse_number: String(item.horse_number),
          lead_position: Number(item.lead_position),
          wide_position: Number(item.wide_position)
        }))
      };
    } catch (error) {
      console.log(`No pace data found for ${date} race ${raceNumber}: ${error.message}`);
    }

    // 5. Load prediction data if available
    let predictions = null;
    try {
      // Load DBL prediction
      let dblData = null;
      try {
        const dblFileName = buildPredictionFilePath(date, raceNumber, 'DBL', timestamp);
        const dblModule = await import(`../data/predictions/${dblFileName}`);
        dblData = dblModule.default;
      } catch (error) {
        console.log(`No DBL prediction found for ${date} race ${raceNumber}: ${error.message}`);
      }

      // Load Q prediction
      let qData = null;
      try {
        const qFileName = buildPredictionFilePath(date, raceNumber, 'Q', timestamp);
        const qModule = await import(`../data/predictions/${qFileName}`);
        qData = qModule.default;
      } catch (error) {
        console.log(`No Q prediction found for ${date} race ${raceNumber}: ${error.message}`);
      }

      // Load QP prediction
      let qpData = null;
      try {
        const qpFileName = buildPredictionFilePath(date, raceNumber, 'QP', timestamp);
        const qpModule = await import(`../data/predictions/${qpFileName}`);
        qpData = qpModule.default;
      } catch (error) {
        console.log(`No QP prediction found for ${date} race ${raceNumber}: ${error.message}`);
      }

      // Load RTG prediction
      let rtgData = null;
      try {
        const rtgFileName = buildRTGFilePath(date, raceNumber, 'RTG');
        const rtgModule = await import(`../data/predictions/${rtgFileName}`);
        rtgData = rtgModule.default;
      } catch (error) {
        console.log(`No RTG prediction found for ${date} race ${raceNumber}: ${error.message}`);
      }

      // Create predictions structure if any prediction data is available
      if (dblData || qData || qpData || rtgData) {
        predictions = {
          "Race Date": date,
          "Race Number": String(raceNumber),
          "DBL1": dblData ? String(dblData.DBL1 || "") : "",
          "DBL2": dblData ? String(dblData.DBL2 || "") : "",
          "DBL3": dblData ? String(dblData.DBL3 || "") : "",
          "Q1": qData ? String(qData.Q || "") : "",
          "Q2": qData ? String(qData.Q2 || "") : "",
          "Q3": qData ? String(qData.Q3 || "") : "",
          "Q4": qData ? String(qData.Q4 || "") : "",
          "QP1": qpData ? String(qpData.QP || "") : "",
          "QP2": qpData ? String(qpData.QP2 || "") : "",
          "QP3": qpData ? String(qpData.QP3 || "") : "",
          "QP4": qpData ? String(qpData.QP4 || "") : "",
          "RTG1": rtgData ? String(rtgData.RTG1 || "") : "",
          "RTG2": rtgData ? String(rtgData.RTG2 || "") : "",
          "RTG3": rtgData ? String(rtgData.RTG3 || "") : "",
          "RTG4": rtgData ? String(rtgData.RTG3 || "") : "",
          "score1": rtgData ? String(rtgData.score1 || "") : "",
          "score2": rtgData ? String(rtgData.score2 || "") : "",
          "score3": rtgData ? String(rtgData.score3 || "") : ""
        };
      }
    } catch (error) {
      console.log(`Error loading prediction data for ${date} race ${raceNumber}: ${error.message}`);
    }

    // 6. Return standardized structure
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
      },
      paceData,
      predictions
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

// Helper to check if predictions are available
export const hasPredictions = (data) => {
  return data?.predictions !== null;
};
