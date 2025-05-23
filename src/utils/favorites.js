// src/utils/favorites.js
// There are two sets: find<pool>Favourite for alerts and find<pool>FavouriteX for horse numbers/ combinations 
//!TYPES IMPORTS!
/// <reference path="./types.js" />

import { createAlert } from './alertSystem';

/**
 * Finds the horse(s) with lowest non-zero win odds
 * @param {Array<RaceHorse>} odds 
 * @param {HorseInfo} horseInfo 
 * @returns {Array<AlertMessage>}
 */
export const findWinFavorite = (odds, horseInfo) => {
  if (!odds?.length) return [createAlert(0, 'ALL', 'Alert', 'No horses in race')];

  // Filter out horses with 0 odds (withdrawn)
  const validOdds = odds.filter(horse => horse.win > 0);
  if (!validOdds.length) return [createAlert(0, 'ALL', 'Alert', 'No active horses in race')];

  const sorted = [...validOdds].sort((a, b) => a.win - b.win);
  const minWinOdds = sorted[0].win;
  const favorites = sorted.filter(h => h.win === minWinOdds);

  const alerts = [];
  favorites.forEach(horse => {
    const horseDetail = horseInfo?.Horses?.find(h => h['Horse Number'] === horse.horseNumber);
    const horseName = horseDetail?.['Horse Name'] || 'Unknown';

    alerts.push(
      createAlert(50, horse.horseNumber, 'Win', ' ', 100, 100),
      createAlert(150, horse.horseNumber, 'Info', 
        `Info - Win Favourite is ${horse.horseNumber} ${horseName} ${horse.win}`, 
        0, 0
      )
    );
  });

  if (favorites.length > 1) {
    alerts.push(createAlert(100, favorites[0].horseNumber, 'Alert', 'Info - Two win favourites!', 0, 0));
  }

  return alerts;
};

/**
 * Finds the horse(s) with lowest non-zero place odds 
 * @param {Array<RaceHorse>} odds
 * @param {HorseInfo} horseInfo
 * @returns {Array<AlertMessage>}
 */
export const findPlaceFavorite = (odds, horseInfo) => {
  if (!odds?.length) return [createAlert(0, 'ALL', 'Alert', 'No horses in race')];

  // Filter out horses with 0 odds (withdrawn)
  const validOdds = odds.filter(horse => horse.place > 0);
  if (!validOdds.length) return [createAlert(0, 'ALL', 'Alert', 'No active horses in race')];

  const sorted = [...validOdds].sort((a, b) => a.place - b.place);
  const minPlaceOdds = sorted[0].place;
  const favorites = sorted.filter(h => h.place === minPlaceOdds);

  const alerts = [];
  favorites.forEach(horse => {
    const horseDetail = horseInfo?.Horses?.find(h => h['Horse Number'] === horse.horseNumber);
    const horseName = horseDetail?.['Horse Name'] || 'Unknown';

    alerts.push(
      createAlert(50, horse.horseNumber, 'Place', ' ', 0, 100),
      createAlert(150, horse.horseNumber, 'Info', 
        `Info - Place Favourite is ${horse.horseNumber} ${horseName} ${horse.place}`, 
        0, 0
      )
    );
  });

  if (favorites.length > 1) {
    alerts.push(createAlert(100, favorites[0].horseNumber, 'Alert', 'Multiple place favourites!', 0, 0));
  }

  return alerts;
};

/**
 * Finds the quinella combination(s) with lowest non-zero odds
 * @param {Array<QuinellaPair>} quinellaOdds
 * @returns {Array<AlertMessage>}
 */
export const findQuinellaFavorite = (quinellaOdds) => {
  if (!quinellaOdds?.length) return [createAlert(0, 'ALL', 'Alert', 'No quinella odds available')];

  // Filter out combinations with 0 odds (withdrawn horses)
  const validOdds = quinellaOdds.filter(q => q.odds > 0);
  if (!validOdds.length) return [createAlert(0, 'ALL', 'Alert', 'No active quinella combinations')];

  const sorted = [...validOdds].sort((a, b) => a.odds - b.odds);
  const minOdds = sorted[0].odds;
  const favorites = sorted.filter(q => q.odds === minOdds);

  const alerts = [];
  favorites.forEach(combo => {
    const comboId = `${combo.horse_number_1}-${combo.horse_number_2}`;
    alerts.push(
      createAlert(150, comboId, 'Q', `Info - Favourite Q is ${comboId} with odds ${combo.odds}`, 0, 0),
      createAlert(20, combo.horse_number_1, 'Info', 'favourite Q leg', 30, 30),
      createAlert(20, combo.horse_number_2, 'Info', 'favourite Q leg', 30, 30)
    );
  });

  if (favorites.length > 1) {
    const firstCombo = `${favorites[0].horse_number_1}-${favorites[0].horse_number_2}`;
    alerts.push(createAlert(100, firstCombo, 'Alert', 'Info - Two Q favourites!', 0, 0));
  }

  return alerts;
};

/**
 * Finds the place quinella combination(s) with lowest non-zero odds
 * @param {Array<QuinellaPair>} quinellaPlaceOdds 
 * @returns {Array<AlertMessage>}
 */
export const findPQFavorite = (quinellaPlaceOdds) => {
  if (!quinellaPlaceOdds?.length) return [createAlert(0, '14', 'Info', 'No PQ odds available')];

  // Filter out combinations with 0 odds (withdrawn horses)
  const validOdds = quinellaPlaceOdds.filter(q => q.odds > 0);
  if (!validOdds.length) return [createAlert(0, 'ALL', 'Alert', 'No active PQ combinations')];

  const sorted = [...validOdds].sort((a, b) => a.odds - b.odds);
  const minOdds = sorted[0].odds;
  const favorites = sorted.filter(q => q.odds === minOdds);

  const alerts = [];
  favorites.forEach(combo => {
    const comboId = `${combo.horse_number_1}-${combo.horse_number_2}`;
    alerts.push(
      createAlert(150, comboId, 'PQ', `Info - Favourite PQ is ${comboId} with odds ${combo.odds}`, 0, 0),
      createAlert(20, combo.horse_number_1, 'Info', 'favourite PQ leg', 10, 30),
      createAlert(20, combo.horse_number_2, 'Info', 'favourite PQ leg', 10, 30)
    );
  });

  if (favorites.length > 1) {
    const firstCombo = `${favorites[0].horse_number_1}-${favorites[0].horse_number_2}`;
    alerts.push(createAlert(100, firstCombo, 'Alert', 'Info - Two PQ favourites!', 0, 0));
  }

  return alerts;
};

/**
 * Finds the horse(s) with the lowest non-zero win odds
 * @param {Array<RaceHorse>} odds 
 * @returns {string[]} - Array of horse numbers with the lowest win odds
 */
export const findWinFavoriteX = (odds) => {
  if (!odds?.length) return [];

  // Filter out horses with 0 odds (withdrawn)
  const validOdds = odds.filter(horse => horse.win > 0);
  if (!validOdds.length) return [];

  const minWinOdds = Math.min(...validOdds.map(horse => horse.win));
  const favorites = validOdds.filter(horse => horse.win === minWinOdds).map(horse => horse.horseNumber);
  
  return favorites;
};

/**
 * Finds the horse(s) with the lowest non-zero place odds
 * @param {Array<RaceHorse>} odds
 * @returns {string[]} - Array of horse numbers with the lowest place odds
 */
export const findPlaceFavoriteX = (odds) => {
  if (!odds?.length) return [];

  // Filter out horses with 0 odds (withdrawn)
  const validOdds = odds.filter(horse => horse.place > 0);
  if (!validOdds.length) return [];

  const minPlaceOdds = Math.min(...validOdds.map(horse => horse.place));
  const favorites = validOdds.filter(horse => horse.place === minPlaceOdds).map(horse => horse.horseNumber);
  
  return favorites;
};

/**
 * Finds the quinella combination(s) with the lowest non-zero odds
 * @param {Array<QuinellaPair>} quinellaOdds
 * @returns {Array<string[]>} - Array of pairs [horse_number_1, horse_number_2] with the lowest odds
 */
export const findQuinellaFavoriteX = (quinellaOdds) => {
  if (!quinellaOdds?.length) return [];

  // Filter out combinations with 0 odds (withdrawn horses)
  const validOdds = quinellaOdds.filter(q => q.odds > 0);
  if (!validOdds.length) return [];

  const minOdds = Math.min(...validOdds.map(q => q.odds));
  const favorites = validOdds.filter(q => q.odds === minOdds).map(q => [q.horse_number_1, q.horse_number_2]);
  
  return favorites;
};

/**
 * Finds the place quinella combination(s) with the lowest non-zero odds
 * @param {Array<QuinellaPair>} quinellaPlaceOdds 
 * @returns {Array<string[]>} - Array of pairs [horse_number_1, horse_number_2] with the lowest odds
 */
export const findPQFavoriteX = (quinellaPlaceOdds) => {
  if (!quinellaPlaceOdds?.length) return [];

  // Filter out combinations with 0 odds (withdrawn horses)
  const validOdds = quinellaPlaceOdds.filter(q => q.odds > 0);
  if (!validOdds.length) return [];

  const minOdds = Math.min(...validOdds.map(q => q.odds));
  const favorites = validOdds.filter(q => q.odds === minOdds).map(q => [q.horse_number_1, q.horse_number_2]);
  
  return favorites;
};