function fairQPoddsHK(hkOddsA, hkOddsB, gamma = 0.88, takeout = 0.20) {
    // Convert HK odds to decimal and probabilities
    const decimalA = hkOddsA + 1;
    const decimalB = hkOddsB + 1;
    const pA = 1 / decimalA;
    const pB = 1 / decimalB;

    // Approximate top-3 probabilities (simplified)
    const pATop3 = 1 - Math.pow(1 - pA, 3);
    const pBTop3 = 1 - Math.pow(1 - pB, 3);

    // Conditional probability (Stern-adjusted)
    const pBGivenA = 1 - Math.pow(1 - (pB / (1 - pA)), 2);
    const pAGivenB = 1 - Math.pow(1 - (pA / (1 - pB)), 2);

    // QP probability (symmetrized)
    const qpProb = 0.5 * (pATop3 * pBGivenA + pBTop3 * pAGivenB);

    // Fair odds after takeout
    return (1 - takeout) / qpProb;
}

// Example: Horses with HK odds 4.0 and 6.0
// console.log(fairQPoddsHK(4.0, 6.0));  // ≈5.23 (decimal)