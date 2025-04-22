// src/components/QuinellaPlaceMatrix.jsx
// v1.0.2 - Updated highlight logic for upper triangle only with column-first ordering
import React from 'react';

const QuinellaPlaceMatrix = ({ quinellaPlaceOdds, horseCount = 14, highlights = [] }) => {
  // Debug: Verify input data structure
  console.log('[QuinellaPlaceMatrix] Input data sample:', {
    firstThreePairs: quinellaPlaceOdds?.slice(0, 3),
    totalPairs: quinellaPlaceOdds?.length,
    samplePair: quinellaPlaceOdds?.find(q => 
      q.horse_number_1 === "1" && 
      q.horse_number_2 === "2"
    )
  });

  // Normalize highlights to column-first format (e.g., "6-7" becomes "7-6")
  const normalizedHighlights = highlights.map(pair => {
    const [a, b] = pair.split('-').map(Number);
    return a < b ? `${b}-${a}` : pair;
  });

  // Create matrix data (upper triangle only)
  const matrix = Array.from({ length: horseCount }, (_, i) => 
    Array.from({ length: horseCount }, (_, j) => {
      if (i >= j) return null;
      
      // Find matching pair (column-first order)
      const pair = quinellaPlaceOdds?.find(q => {
        const horse1 = parseInt(q.horse_number_1, 10);
        const horse2 = parseInt(q.horse_number_2, 10);
        return (
          (horse1 === j+1 && horse2 === i+1) ||  // Column-first match
          (horse2 === j+1 && horse1 === i+1)     // Reverse match
        );
      });

      // Debug logging for found pairs
      if (pair) {
        console.log(`[Debug] Found PLQ pair ${j+1}-${i+1}:`, {
          odds: pair.odds,
          horse1: pair.horse_number_1, 
          horse2: pair.horse_number_2
        });
      }

      return pair ? pair.odds : 'N/A';
    })
  );

  return (
    <div className="quinella-place-matrix">
      <h3>Quinella Place (PLQ) Odds Matrix</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: horseCount }, (_, i) => (
              <th key={i+1}>#{i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th>#{i+1}</th>
              {row.map((cell, j) => {
                if (i >= j) {
                  return <td key={j} className="diagonal"></td>;
                }
                
                const comboKey = `${j+1}-${i+1}`; // Column-first format
                const isHighlighted = normalizedHighlights.includes(comboKey);
                
                console.log(`Checking highlight for cell ${i+1}-${j+1} as key: ${comboKey}`, {
                  isHighlighted,
                  normalizedHighlights
                });

                return (
                  <td 
                    key={j}
                    className={isHighlighted ? 'highlight-quinella' : ''}
                    data-testid={`plq-cell-${j+1}-${i+1}`}
                    style={isHighlighted ? { 
                      backgroundColor: '#ffdddd',
                      fontWeight: 'bold',
                      border: '2px solid #ff0000'
                    } : {}}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuinellaPlaceMatrix;