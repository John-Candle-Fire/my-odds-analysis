// src/utils/predictionUtils.js

/**
 * Utility functions for handling prediction data and generating prediction-related alerts
 * 
 * This function creates individual alert messages for each prediction field:
 * - DBL1, DBL2, DBL3 (Double bet predictions)
 * - Q1, Q2, Q3, Q4 (Quinella predictions) 
 * - QP1, QP2, QP3, QP4 (Quinella Place predictions)
 * - RTG1, RTG2, RTG3 (Rating predictions) plus their scores
 */

import { createAlert, addAlert } from './alertSystem.js';

/**
 * Creates prediction-based alert messages for all predicted horses
 * Creates one alert message per prediction field (e.g., one for DBL1, one for DBL2, etc.)
 * @param {Object} raceData - The complete race data including predictions and horse info
 */
export const createPredictionAlerts = (raceData) => {
  console.log('=== Starting createPredictionAlerts ===');

  // Validate input data
  if (!raceData) {
    console.log('No raceData provided');
    return;
  }

  if (!raceData.predictions) {
    console.log('No predictions found in raceData');
    return;
  }

  if (!raceData.horseInfo || !raceData.horseInfo.Horses) {
    console.log('No horse info found in raceData');
    return;
  }

  const { predictions, horseInfo } = raceData;
  const horses = horseInfo.Horses;

  console.log('Predictions object:', predictions);
  console.log('Number of horses:', horses.length);

  // Create a lookup map for horse details by horse number
  const horseMap = new Map();
  horses.forEach(horse => {
    horseMap.set(horse["Horse Number"], horse);
  });

  console.log('Created horse lookup map with', horseMap.size, 'entries');

  // Function to create base message identical to winInsiderAnalysis.js
  const createBaseMessage = (horse) => {
    const horseNumber = horse["Horse Number"];
    const horseName = horse["Horse Name"] || 'Unknown';
    const winOdds = horse.Win || 0;
    const winIndex = horse["Race Day Win Index"] || 0;
    const lastWin = horse.lastWin || 0;
    const lastPosition = horse.lastPosition || 0;

    // Calculate percentage difference (same logic as winInsiderAnalysis.js)
    const percentageDiff = winIndex > 0 ? ((winIndex - winOdds) / winIndex) * 100 : 0;
    const formattedPct = percentageDiff.toFixed(2) + '%';

    return `${horseNumber} ${horseName}: Current odds ${winOdds} vs expected ${winIndex} (${formattedPct}). Last race: ${lastWin} odds, finished ${lastPosition}`;
  };

  // Function to create and add individual prediction alert
  const createPredictionAlert = (predictionField, horseNumber, priority, winScore, placeScore) => {
    console.log(`Processing ${predictionField} with horse number: ${horseNumber}`);

    // Skip if no horse number provided
    if (!horseNumber || horseNumber === "" || horseNumber === "0") {
      console.log(`Skipping ${predictionField} - invalid horse number: ${horseNumber}`);
      return;
    }

    // Look up horse details
    const horse = horseMap.get(String(horseNumber));
    if (!horse) {
      console.log(`Skipping ${predictionField} - horse ${horseNumber} not found in race data`);
      console.log('Available horse numbers:', Array.from(horseMap.keys()));
      return;
    }

    // Create the base message using the same format as winInsiderAnalysis.js
    let baseMessage = createBaseMessage(horse);
    if (['RTG1', 'RTG2', 'RTG3'].includes(predictionField)) {
      baseMessage += ' !Score = ' + Number(winScore).toFixed(2);
    }

    // Create the prediction alert message: "DBL1 - <baseMessage>"
    const alertMessage = `${predictionField} - ${baseMessage}`;

    console.log(`Creating alert for ${predictionField}: ${alertMessage}`);

    // Create and add the alert using the same pattern as winInsiderAnalysis.js
    addAlert(createAlert(
      priority,
      String(horseNumber),
      'Info',
      alertMessage,
      winScore,
      placeScore
    ));

    console.log(`Successfully added alert for ${predictionField}`);
  };

  // Process all prediction fields individually
  console.log('Processing DBL predictions...');

  // DBL predictions - Higher priority (170) for DBL1, DBL2; Lower priority (160) for DBL3
  if (predictions.DBL1) {
    createPredictionAlert('DBL1', predictions.DBL1, 170, 50, 60);
  }
  if (predictions.DBL2) {
    createPredictionAlert('DBL2', predictions.DBL2, 170, 50, 60);
  }
  if (predictions.DBL3) {
    createPredictionAlert('DBL3', predictions.DBL3, 160, 40, 30);
  }

  console.log('Processing Q predictions...');

  // Q predictions - Higher priority (170) for Q1, Q2; Lower priority (160) for Q3, Q4
  if (predictions.Q1) {
    createPredictionAlert('Q1', predictions.Q1, 170, 50, 60);
  }
  if (predictions.Q2) {
    createPredictionAlert('Q2', predictions.Q2, 170, 50, 60);
  }
  if (predictions.Q3) {
    createPredictionAlert('Q3', predictions.Q3, 160, 40, 30);
  }
  if (predictions.Q4) {
    createPredictionAlert('Q4', predictions.Q4, 160, 40, 30);
  }

  console.log('Processing QP predictions...');

  // QP predictions - Higher priority (170) for QP1, QP2; Lower priority (160) for QP3, QP4
  if (predictions.QP1) {
    createPredictionAlert('QP1', predictions.QP1, 170, 50, 60);
  }
  if (predictions.QP2) {
    createPredictionAlert('QP2', predictions.QP2, 170, 50, 60);
  }
  if (predictions.QP3) {
    createPredictionAlert('QP3', predictions.QP3, 160, 40, 30);
  }
  if (predictions.QP4) {
    createPredictionAlert('QP4', predictions.QP4, 160, 40, 30);
  }

  console.log('Processing RTG predictions...');

  // RTG predictions - Higher priority (170) for RTG1, RTG2, RTG3
  if (predictions.DBL1) {
    createPredictionAlert('RTG1', predictions.RTG1, 160, parseFloat(predictions.score1), 60);
  }
  if (predictions.DBL2) {
    createPredictionAlert('RTG2', predictions.RTG2, 160, parseFloat(predictions.score2), 30);
  }
  if (predictions.DBL3) {
    createPredictionAlert('RTG3', predictions.RTG3, 160, parseFloat(predictions.score3), 60);
  }


  console.log('=== Finished createPredictionAlerts ===');
};

export default {
  createPredictionAlerts
};
