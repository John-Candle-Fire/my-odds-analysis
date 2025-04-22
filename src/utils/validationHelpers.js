// src/utils/validationHelpers.js
/**
 * Validates horse numbers based on context
 * @param {string} input
 * @param {boolean} isCombo - Whether checking Q/PQ combo
 * @returns {boolean}
 */
export const validateHorseNumber = (input, isCombo) => {
    if (isCombo) {
      const [num1, num2] = input.split('-').map(Number);
      return (
        input.includes('-') &&
        num1 >= 1 && num1 <= 14 &&
        num2 >= 1 && num2 <= 14 &&
        num1 !== num2
      );
    }
    const num = Number(input);
    return num >= 1 && num <= 14;
  };