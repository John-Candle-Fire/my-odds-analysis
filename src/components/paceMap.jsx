// ./components/PaceMapTab.jsx
// version 1.0.0
import React from 'react';
import { Box, Typography } from '@mui/material';

const PaceMap = ({ paceData, raceData, highlights }) => {
  // Calculate grid dimensions based on maximum positions
  const numRows = paceData.positions.length > 0 
    ? Math.max(...paceData.positions.map(p => p.wide_position)) 
    : 1;
  const numColumns = paceData.positions.length > 0 
    ? Math.max(...paceData.positions.map(p => p.lead_position)) 
    : 1;

  // Determine if it's a Sha Tin 1000m race for column orientation
  const isShaTin1000 = paceData.course === "沙田" && paceData.distance === 1000;

  // Create a map for win odds
  console.log('PaceMap props:', { paceData, raceData, highlights });
  const winOddsMap = new Map(raceData.odds.map(h => [h.horseNumber, h.win]));

  // Group horses by their grid positions
  const cellMap = new Map();
  paceData.positions.forEach(horse => {
    const gridRow = numRows - horse.wide_position + 1; // Row 1 at bottom
    const gridColumn = isShaTin1000 
      ? horse.lead_position // Column 1 leftmost
      : numColumns - horse.lead_position + 1; // Column 1 rightmost
    const key = `${gridRow}-${gridColumn}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key).push(horse);
  });

  // Precompute grid cells
  const gridCells = [];
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numColumns; col++) {
      const key = `${row}-${col}`;
      const horsesInCell = cellMap.get(key) || [];
      gridCells.push(
        <Box 
          key={key} 
          sx={{ 
            gridRow: row, 
            gridColumn: col, 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            alignItems: 'center', 
            border: '1px solid #ddd', 
            padding: '5px',
            minHeight: '60px' // Ensure empty cells are visible
          }}
        >
          {horsesInCell.map(horse => (
            <Box 
              key={horse.horse_number} 
              sx={{ 
                padding: '5px', 
                margin: '2px', 
                backgroundColor: highlights?.win?.includes(horse.horse_number) ? '#ffdddd' : '#f0f0f0', 
                borderRadius: '3px', 
                textAlign: 'center',
                minWidth: '50px'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {horse.horse_number}
              </Typography>
              <Typography variant="body2">
                {winOddsMap.get(horse.horse_number) || 'N/A'}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
  }

  return (
    <Box>
      {/* Grid Display */}
      <Box sx={{ overflowX: 'auto', marginTop: '20px' }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`, 
            gridTemplateRows: `repeat(${numRows}, 1fr)`, 
            gap: '5px' 
          }}
        >
          {gridCells}
        </Box>
      </Box>
    </Box>
  );
};

export default PaceMap;