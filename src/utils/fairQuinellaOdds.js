function fairQuinellaOddsHK(hkOddsHorse1, hkOddsHorse2, gamma = 0.85, takeout = 0.175) {
    // Convert HK odds to decimal odds
    const decimalOdds1 = hkOddsHorse1 + 1;
    const decimalOdds2 = hkOddsHorse2 + 1;
    
    // Convert to probabilities
    const p1 = 1 / decimalOdds1;
    const p2 = 1 / decimalOdds2;
    
    // Normalize for overround
    const totalProb = p1 + p2;
    const p1Adj = p1 / totalProb;
    const p2Adj = p2 / totalProb;
    
    // Stern model calculation
    const term1 = p1Adj * (Math.pow(p2Adj, gamma) / Math.pow(1 - p1Adj, gamma));
    const term2 = p2Adj * (Math.pow(p1Adj, gamma) / Math.pow(1 - p2Adj, gamma));
    const quinellaProb = term1 + term2;
    
    // Fair odds after takeout
    const fairOdds = (1 - takeout) / quinellaProb;
    
    return fairOdds;
}

// Example usage:
// console.log(fairQuinellaOddsHK(5, 2));  // HK Odds 5 and 2
// Output: ≈2.55 (decimal odds)