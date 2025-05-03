// src/utils/alertSystem.js
// v1.0.1 add addAlert updateAlert getAlerts clearAlerts 
// v1.0.2 add deduplicateAlerts
// v2.0.0 - Unified Alert System with Legacy Support

// Internal storage
let alerts = [];

// Highlight storage
const highlightStore = {
  win: new Set(),
  place: new Set(),
  quinella: new Set(),
  placeQuinella: new Set()
};

// ===================
// Core Functions
// ===================

export const resetHighlights = () => {
  highlightStore.win.clear();
  highlightStore.place.clear();
  highlightStore.quinella.clear();
  highlightStore.placeQuinella.clear();
};

export const getHighlights = () => ({
  win: Array.from(highlightStore.win),
  place: Array.from(highlightStore.place),
  quinella: Array.from(highlightStore.quinella),
  placeQuinella: Array.from(highlightStore.placeQuinella)
});

// ===================
// Alert Creation
// ===================

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
 * Creates an alert (modern or legacy format)
 * @param {number} priority 
 * @param {string} horseNumber 
 * @param {'Display'|'Highlight'|'Analyze'|LegacyActionType} purposeOrAction 
 * @param {string} [message] 
 * @param {number} [winScore=0] 
 * @param {number} [placeScore=0] 
 * @param {'Win'|'Place'|'Q'|'PQ'|'Generic'} [target='Generic']
 * @param {Partial<AlertMetrics>} [metrics={}]
 * @returns {AlertMessage}
 */
export const createAlert = (
  priority = 100,
  horseNumber,
  purposeOrAction,
  message = '',
  winScore = 0,
  placeScore = 0,
  target = 'Generic',
  metrics = {}
) => {
  // Validation
  if (!Number.isInteger(priority)) {
    throw new Error(`Priority must be integer, got ${priority}`);
  }

  // Convert legacy format
  let purpose, resolvedTarget;
  const legacyActions = ['Win','Place','Q','PQ'];
  if (legacyActions.includes(purposeOrAction)) {
    purpose = 'Highlight';
    resolvedTarget = purposeOrAction;
  } else if (purposeOrAction === 'Info') {
    purpose = 'Analyze';
    resolvedTarget = target;
  } else if (purposeOrAction === 'Alert') {
    purpose = 'Display';
    resolvedTarget = 'Generic';
  } else {
    purpose = purposeOrAction; // Modern format
    resolvedTarget = target;
  }

  // Horse number validation
  const isCombo = ['Q','PQ'].includes(resolvedTarget);
  if (!isValidHorseNumber(horseNumber, isCombo)) {
    throw new Error(`Invalid horseNumber: ${horseNumber} for target ${resolvedTarget}`);
  }

  // Merge metrics
  const resolvedMetrics = {
    winScore: Number(winScore),
    placeScore: Number(placeScore),
    ...metrics
  };

  return {
    priority: Math.max(0, priority),
    horseNumber,
    purpose,
    target: resolvedTarget,
    message: String(message),
    metrics: resolvedMetrics
  };
};

// ===================
// Alert Management
// ===================

export const addAlert = (alert, autoSort = false) => {
  if (!isAlert(alert)) throw new Error('Invalid alert object');
  alerts.push(alert);
  if (autoSort) alerts.sort((a, b) => b.priority - a.priority);
};

export const updateAlert = (index, updates) => {
  if (index < 0 || index >= alerts.length) return false;
  
  const updated = { ...alerts[index], ...updates };
  if (!isAlert(updated)) return false;
  
  alerts[index] = updated;
  return true;
};

export const getAlerts = (sorted = true) => {
  return sorted ? [...alerts].sort((a, b) => b.priority - a.priority) : [...alerts];
};

export const clearAlerts = () => {
  alerts = [];
};

export const deduplicateAlerts = (alerts) => {
  return alerts.filter((alert, index, self) =>
    index === self.findIndex(a => 
      a.priority === alert.priority &&
      a.horseNumber === alert.horseNumber &&
      a.purpose === alert.purpose &&
      a.target === alert.target &&
      a.message === alert.message &&
      JSON.stringify(a.metrics) === JSON.stringify(alert.metrics)
    )
  );
};

// ===================
// Utilities
// ===================

export const isAlert = (obj) => {
  const isNewFormat = obj && 
    typeof obj.priority === 'number' &&
    typeof obj.horseNumber === 'string' &&
    ['Display','Highlight','Analyze'].includes(obj.purpose) &&
    typeof obj.metrics === 'object';

  const isLegacyFormat = obj && 
    typeof obj.priority === 'number' &&
    typeof obj.horseNumber === 'string' &&
    ['Info','Alert','Win','Place','Q','PQ'].includes(obj.action);

  return isNewFormat || isLegacyFormat;
};

/**
 * Handles alert actions
 * @param {AlertMessage} alert
 */
export const handleAlertAction = (alert) => {
  const target = alert.action || alert.target;
  
  // Map action/target to correct store keys
  const storeMap = {
    'Q': 'quinella',
    'PQ': 'placeQuinella',
    'Win': 'win',
    'Place': 'place'
  };
  
  const storeKey = storeMap[target];
  
  if (storeKey && highlightStore[storeKey]) {
    highlightStore[storeKey].add(alert.horseNumber);
    console.log(`Stored ${target} highlight:`, alert.horseNumber); // Debug
  }
};

export const findAlertIndex = (horseNumber) => {
  return alerts.findIndex(a => a.horseNumber === horseNumber);
};

export const addAlerts = (alertList, autoSort = false) => {
  alertList.forEach(alert => addAlert(alert, false));
  if (autoSort) alerts.sort((a, b) => b.priority - a.priority);
};

// ===================
// Legacy Support
// ===================

/**
 * Legacy createAlert (compatibility wrapper)
 * @deprecated Use new createAlert format
 */
export const createLegacyAlert = (
  priority,
  horseNumber,
  action,
  message,
  winScore = 0,
  placeScore = 0
) => {
  return createAlert(
    priority,
    horseNumber,
    action,
    message,
    winScore,
    placeScore
  );
};