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
// Preprocessing Structures - for analysis
// This will be used in the analysis so that 'common' information can be accessed across all modules
// ===================
/**
 * @typedef {Object} PreprocessedHorse
 * @property {string} horseNumber - Unique identifier for the horse
 * @property {string} horseName - Name of the horse
 * @property {string} trainer - Trainer's name
 * @property {string} jockey - Jockey's name
 * @property {string} weight - Horse's weight
 * @property {number} firstDayIndex - First Day Win Index
 * @property {number} raceDayIndex - Race Day Win Index
 * @property {number} lastWin - Last win odds
 * @property {number} lastPosition - Last race's position 
 * @property {number} win - Win odds
 * @property {number} place - Place odds
 * @property {number} expectedP - Expected place odds (from linear regression)
 * @property {string} category - Group category (e.g., "Favourites")
 * @property {boolean} isNewHorse - True if no previous races
 * @property {boolean} isBeatIndex - True if win < raceDayIndex
 * @property {boolean} lastGoodResult - True if last position was 1st–4th
 * @property {boolean} sameWinRange - True if win odds in same range as last win
 * @property {boolean} isWinFavorite - True if this is the win favorite
 * @property {boolean} isPlaceFavorite - True if this is the place favorite
 * @property {boolean} isQFavourite - True if the horse is part of the quinella favorite pair
 * @property {boolean} isPQFavourite - True if the horse is part of the place quinella favorite pair
 */

/**
 * @typedef {Object} PreprocessedQuinellaPair
 * @property {string} horse_number_1 - First horse in the pair
 * @property {string} horse_number_2 - Second horse in the pair
 * @property {number} actualOdds - Actual quinella odds
 * @property {number} expectedOdds - Expected odds from linear regression
 * @property {number} residual - Difference between expected and actual odds
 */

/**
 * @typedef {Object} PreprocessedPlaceQPair
 * @property {string} horse_number_1 - First horse in the pair
 * @property {string} horse_number_2 - Second horse in the pair
 * @property {number} actualOdds - Actual quinella odds
 * @property {number} expectedOdds - Expected odds from linear regression
 * @property {number} residual - Difference between expected and actual odds
 */

/**
 * @typedef {Object} PreprocessedRaceData
 * @property {PreprocessedHorse[]} horses - Array of preprocessed horse data
 * @property {PreprocessedQuinellaPair[]} quinellaPairs - Array of quinella pairs with odds analysis
 * @property {PreprocessedPlaceQPair[]} placeQPairs - Array of place quinella pairs with odds analysis
 * @property {string} winFavourite - Horse number of the win favorite
 * @property {string} placeFavourite - Horse number of the place favorite
 * @property {string[]} qFavouritePair - Horse numbers of the quinella favorite pair
 * @property {string[]} pqFavouritePair - Horse numbers of the place quinella favorite pair
 */

// ===================
// Legacy Support
// ===================

/**
 * @typedef {'Info'|'Alert'|'Win'|'Place'|'Q'|'PQ'} LegacyActionType
 * @deprecated Use AlertPurpose + AlertTarget instead
 */
// ===================
// Pace Data Structures
// ===================

/**
 * @typedef {Object} PaceHorsePosition
 * @property {string} horse_number - Stringified horse number
 * @property {number} lead_position - X-coordinate (row) in the pace map
 * @property {number} wide_position - Y-coordinate (column) in the pace map
 */

/**
 * @typedef {Object} PaceData
 * @property {string} course - Racecourse name (e.g., "沙田")
 * @property {string} date - Race date in YYYY-MM-DD
 * @property {number} race_number - Race number
 * @property {string} class - Race class (e.g., "第五班")
 * @property {string} track - Track type (e.g., "草地")
 * @property {number} distance - Race distance in meters (e.g., 1400)
 * @property {string} pace - Pace description (e.g., "中等偏慢")
 * @property {PaceHorsePosition[]} positions - Array of horse positions
 */

/**
 * @typedef {Object} RaceData
 * @property {RaceHorse[]} odds
 * @property {QuinellaPair[]} quinella_odds
 * @property {QuinellaPair[]} quinella_place_odds
 * @property {HorseInfo} horseInfo
 * @property {RaceInfo} raceInfo
 * @property {PaceData | null} paceData - Pace map data if available
 */
// Export for TypeScript
export {};