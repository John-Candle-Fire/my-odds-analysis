// src/utils/types.js
/**
 * Core type definitions for horse racing odds analysis
 */

// ===================
// Race Data Structures
// ===================

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
 * @property {string} horseID - Unique identifier (e.g. "HK_2024_K249")
 * @property {string} Horse Number - Stringified number (1-14)
 * @property {string} Horse Name
 * @property {string} Weight - In pounds/lbs (e.g. "126")
 * @property {string} Trainer
 * @property {string} Jockey
 * @property {string} Post - Starting gate position
 * @property {number} First Win Index (0-100)
 * @property {number} Race Day Win Index (0-100)
 * @property {number} lastWin - Win odds from last race (0 if never won)
 * @property {number} lastPosition - Last race finishing position (0 if no history)
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

// ===================
// Alert System
// ===================

/**
 * @typedef {'Display'|'Highlight'|'Analyze'} AlertPurpose
 * - 'Display': Show to user (equivalent to old 'Alert' action)
 * - 'Highlight': UI highlighting (replaces 'Win'/'Place'/'Q'/'PQ')
 * - 'Analyze': Data for summaries (replaces 'Info')
 */

/**
 * @typedef {'Win'|'Place'|'Q'|'PQ'|'Generic'} AlertTarget
 * - What the alert affects (odds type or generic)
 */

/**
 * @typedef {Object} AlertMetrics
 * @property {number} winScore
 * @property {number} placeScore
 * @property {number} [strength] - Normalized 0-1
 * @property {number} [confidence] - 0-100
 * @property {number} [fairWinOdds] - Calculated fair odds
 * @property {number} [fairPlaceOdds]
 */

/**
 * @typedef {Object} AlertMessage
 * @property {number} priority - Integer >= 0
 * @property {string} horseNumber - "1"-"14" or "X-Y" for combos
 * @property {AlertPurpose} purpose
 * @property {AlertTarget} target
 * @property {string} [message] - User-facing text
 * @property {AlertMetrics} metrics
 */

// ===================
// Analysis Structures
// ===================

/**
 * @typedef {'Favorites'|'Contenders'|'LongShots'|'VLongShots'|'Outsiders'} Groupcategory
 */

/**
 * @typedef {Object} GroupConfig
 * @property {string} name
 * @property {[number, number]} range
 * @property {GroupCategory} category
 */

/**
 * @typedef {Object} HorseAnalysisSummary
 * @property {string} horseNumber
 * @property {GroupCategory[]} groups
 * @property {AlertMetrics} metrics - Aggregated from alerts
 * @property {boolean} isWinFavorite
 * @property {boolean} isPlaceFavorite
 * @property {boolean} isQuinellaFavorite
 * @property {string[]} analysisNotes
 */

/**
 * @typedef {Object} RaceAnalysisResult
 * @property {AlertMessage[]} alerts
 * @property {HorseAnalysisSummary[]} summaries
 */

// ===================
// Legacy Support
// ===================

/**
 * @typedef {'Info'|'Alert'|'Win'|'Place'|'Q'|'PQ'} LegacyActionType
 * @deprecated Use AlertPurpose + AlertTarget instead
 */

// Export for TypeScript
export {};