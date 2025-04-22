// src/components/findingsDisplay.jsx
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Chip,
  Stack
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Displays analysis findings with the complete alert system structure
 * @param {Array} findings - Array of alert objects with:
 *   - priority (number)
 *   - horseNumber (string)
 *   - action ('Info'|'Alert'|'Win'|'Place'|'Q'|'PQ')
 *   - message (string)
 *   - winScore (number)
 *   - placeScore (number)
 */
const FindingsDisplay = ({ findings = [] }) => {
  if (!findings.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No alerts to display</Typography>
      </Box>
    );
  }

  // Sort by priority (descending)
  const sortedFindings = [...findings].sort((a, b) => b.priority - a.priority);

  const getActionColor = (action) => {
    switch(action) {
      case 'Win': return 'error.main';
      case 'Place': return 'warning.dark';
      case 'Q': return 'secondary.main';
      case 'PQ': return 'info.dark';
      case 'Alert': return 'error.light';
      default: return 'primary.main';
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'Alert': return <WarningIcon fontSize="small" />;
      case 'Win': 
      case 'Place': return <ErrorIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {sortedFindings.map((finding, index) => (
        <Paper 
          key={`alert-${index}-${finding.priority}`}
          elevation={2}
          sx={{ 
            p: 2,
            mb: 2,
            borderLeft: 4,
            borderColor: getActionColor(finding.action)
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip 
              icon={getActionIcon(finding.action)}
              label={`Priority: ${finding.priority}`}
              size="small"
              color={
                finding.priority >= 100 ? 'error' : 
                finding.priority >= 50 ? 'warning' : 'info'
              }
            />
            {finding.horseNumber && (
              <Chip
                label={`Horse: ${finding.horseNumber}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          <Typography variant="body1" paragraph>
            {finding.message || '[No message]'}
          </Typography>

          <Stack direction="row" spacing={2}>
            <Typography variant="caption">
              Win Score: {finding.winScore}
            </Typography>
            <Typography variant="caption">
              Place Score: {finding.placeScore}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Action: {finding.action}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
};

export default FindingsDisplay;