// src/utils/alertSystem.js
// v1.0.1 add addAlert updateAlert getAlerts clearAlerts 
// v1.0.2 add deduplicateAlerts 
// Internal storage (renamed from messages for clarity)
let alerts = []; 

// Highlight storage
const highlightStore = {
  win: new Set(),
  place: new Set(),
  quinella: new Set(),    // Stores '1-2' strings
  placeQuinella: new Set()
};

// Reset all highlights
export const resetHighlights = () => {
  highlightStore.win.clear();
  highlightStore.place.clear();
  highlightStore.quinella.clear();
  highlightStore.placeQuinella.clear();
};

// Get current highlights
export const getHighlights = () => ({
  win: Array.from(highlightStore.win),
  place: Array.from(highlightStore.place),
  quinella: Array.from(highlightStore.quinella),
  placeQuinella: Array.from(highlightStore.placeQuinella)
});

/**
 * Validates horse numbers (1-14 or X-Y combos)
 * @param {string} num 
 * @param {boolean} [isCombo=false]
 * @returns {boolean}
 */
const isValidHorseNumber = (num, isCombo = false) => {
  if (isCombo) {
    const parts = num.split('-');
    if (parts.length !== 2) return false;
    const [n1, n2] = parts.map(n => parseInt(n, 10));
    return !isNaN(n1) && !isNaN(n2) && 
           n1 >= 1 && n1 <= 14 && 
           n2 >= 1 && n2 <= 14 &&
           n1 !== n2;
  }
  const n = parseInt(num, 10);
  return !isNaN(n) && n >= 1 && n <= 14;
};

/**
 * Creates a validated alert message
 * @param {number} [priority=100] - Integer >= 0
 * @param {string} horseNumber - Stringified 1-14 or "X-Y" combo
 * @param {'Info'|'Alert'|'Win'|'Place'|'Q'|'PQ'} action
 * @param {string} message
 * @param {number} [winScore=0]
 * @param {number} [placeScore=0]
 * @returns {AlertMessage}
 * @throws {Error} On invalid input
 */
export const createAlert = (
  priority = 100,
  horseNumber,
  action,
  message,
  winScore = 0,
  placeScore = 0
) => {
  // Validation
  if (!Number.isInteger(priority)) {
    throw new Error(`Priority must be integer, got ${priority}`);
  }
  
  if (!['Info','Alert','Win','Place','Q','PQ'].includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  const isCombo = ['Q','PQ'].includes(action);
  if (!isValidHorseNumber(horseNumber, isCombo)) {
    throw new Error(`Invalid horseNumber: ${horseNumber} for action ${action}`);
  }

  return {
    priority: Math.max(0, priority),
    horseNumber,
    action,
    message: String(message),
    winScore: Number(winScore),
    placeScore: Number(placeScore)
  };
};

/**
 * Adds alert to storage with optional auto-sorting
 * @param {AlertMessage} alert 
 * @param {boolean} [autoSort=false] - Whether to sort immediately
 */
export const addAlert = (alert, autoSort = false) => {
  if (!isAlert(alert)) throw new Error('Invalid alert object');
  alerts.push(alert);
  if (autoSort) alerts.sort((a, b) => b.priority - a.priority);
};

/**
 * Updates specific alert fields by index
 * @param {number} index - Alert position in array
 * @param {Partial<AlertMessage>} updates - Fields to update
 * @returns {boolean} True if successful
 */
export const updateAlert = (index, updates) => {
  if (index < 0 || index >= alerts.length) return false;
  
  const updated = { ...alerts[index], ...updates };
  if (!isAlert(updated)) return false;
  
  alerts[index] = updated;
  return true;
};

/**
 * Gets alerts with sorting control
 * @param {boolean} [sorted=true] - Whether to return sorted results
 * @returns {AlertMessage[]}
 */
export const getAlerts = (sorted = true) => {
  return sorted ? [...alerts].sort((a, b) => b.priority - a.priority) : [...alerts];
};

/**
 * Clears all alerts
 */
export const clearAlerts = () => {
  alerts = [];
};

/**
 * Removes duplicate alerts (all fields must match)
 * @param {AlertMessage[]} alerts 
 * @returns {AlertMessage[]} Deduplicated array
 */
export function deduplicateAlerts(alerts) {
  return alerts.filter((alert, index, self) =>
    index === self.findIndex(a => 
      a.priority === alert.priority &&
      a.horseNumber === alert.horseNumber &&
      a.action === alert.action &&
      a.message === alert.message &&
      a.winScore === alert.winScore &&
      a.placeScore === alert.placeScore
    )
  );
}

/**
 * Type guard for AlertMessage
 * @param {any} obj
 * @returns {obj is AlertMessage}
 */
export const isAlert = (obj) => {
  return obj && 
         typeof obj.priority === 'number' &&
         typeof obj.horseNumber === 'string' &&
         ['Info','Alert','Win','Place','Q','PQ'].includes(obj.action) &&
         typeof obj.message === 'string' &&
         typeof obj.winScore === 'number' &&
         typeof obj.placeScore === 'number';
};

/**
 * Handles alert actions
 * @param {AlertMessage} alert
 */
export const handleAlertAction = (alert) => {
  switch(alert.action) {
    case 'Win':
      highlightStore.win.add(alert.horseNumber);
      break;
    case 'Place':
      highlightStore.place.add(alert.horseNumber);
      break;
    case 'Q':
      highlightStore.quinella.add(alert.horseNumber);
      break;
    case 'PQ':
      highlightStore.placeQuinella.add(alert.horseNumber);
      break;
    default:
      break;
  }
};

// New utility functions
/**
 * Finds alert index by horse number
 * @param {string} horseNumber 
 * @returns {number} -1 if not found
 */
export const findAlertIndex = (horseNumber) => {
  return alerts.findIndex(a => a.horseNumber === horseNumber);
};

/**
 * Bulk add alerts with optional sorting
 * @param {AlertMessage[]} alertList 
 * @param {boolean} [autoSort=false]
 */
export const addAlerts = (alertList, autoSort = false) => {
  alertList.forEach(alert => addAlert(alert, false));
  if (autoSort) alerts.sort((a, b) => b.priority - a.priority);
};