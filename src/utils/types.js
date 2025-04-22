// src/utils/types.js
/**
 * @typedef {Object} RaceHorse
 * @property {string} horseNumber - Stringified number (1-14)
 * @property {number} win - Win odds (>= 1.0)
 * @property {number} place - Place odds (>= 1.0)
 */

/**
 * @typedef {Object} QuinellaPair
 * @property {string} horse_number_1 - Stringified number (1-14)
 * @property {string} horse_number_2 - Stringified number (1-14)
 * @property {number} odds - Combined odds (>= 1.0)
 */

/**
 * @typedef {Object} HorseDetail
 * @property {string} Horse Number - Stringified number (1-14)
 * @property {string} Horse Name
 * @property {string} Weight - In pounds/lbs (e.g. "126")
 * @property {string} Trainer
 * @property {string} Jockey
 * @property {string} Post - Starting gate position
 * @property {number} First Win Index (0-100)
 * @property {number} Race Day Win Index (0-100)
 * @property {number} Win - Current win odds
 * @property {number} Place - Current place odds
 */

/**
 * @typedef {Object} HorseInfo
 * @property {string} Race Date - ISO date string
 * @property {string} Race Number - Stringified race number
 * @property {HorseDetail[]} Horses
 */

/**
 * @typedef {Object} RaceInfo
 * @property {string} date
 * @property {string} raceNumber
 * @property {string} timestamp
 * @property {string} url
 */

/**
 * @typedef {Object} RaceData
 * @property {RaceHorse[]} odds
 * @property {QuinellaPair[]} quinella_odds
 * @property {QuinellaPair[]} quinella_place_odds
 * @property {HorseInfo} horseInfo
 * @property {RaceInfo} raceInfo
 */

/**
 * @typedef {'Info'|'Alert'|'Win'|'Place'|'Q'|'PQ'} AlertActionType
 */

/**
 * @typedef {Object} AlertMessage
 * @property {number} priority - Integer >= 0
 * @property {string} horseNumber - Stringified number (1-14) or "X-Y" for Q/PQ
 * @property {AlertActionType} action
 * @property {string} message
 * @property {number} winScore - Any number
 * @property {number} placeScore - Any number
 */

/**
 * @typedef {Object} GroupConfig
 * @property {string} name
 * @property {[number, number]} range
 */