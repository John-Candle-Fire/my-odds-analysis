// raceSelector.jsx - Compact horizontal form layout
import React, { useState, useEffect } from 'react';

const RaceSelector = ({ onAnalyze }) => {
  const [date, setDate] = useState('');
  const [raceNumber, setRaceNumber] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableRaceNumbers, setAvailableRaceNumbers] = useState([]);
  const [availableTimestamps, setAvailableTimestamps] = useState([]);

  // Load all available dates on mount
  useEffect(() => {
    const context = require.context('../data', false, /\.json$/);
    const files = context.keys();
    
    const dates = files.map(filename => {
      const parts = filename.replace('./', '').split('-');
      return `${parts[0]}-${parts[1]}-${parts[2]}`; // YYYY-MM-DD
    });
    
    setAvailableDates([...new Set(dates)].sort());
  }, []);

  // Load race numbers when date changes
  useEffect(() => {
    if (!date) {
      setAvailableRaceNumbers([]);
      return;
    }

    const context = require.context('../data', false, /\.json$/);
    const files = context.keys();
    
    const raceNumbers = files
      .filter(filename => filename.includes(`${date}-`))
      .map(filename => {
        const parts = filename.replace('./', '').split('-');
        return parts[3]; // Returns "R1", "R2", etc.
      });
    
    setAvailableRaceNumbers([...new Set(raceNumbers)].sort((a, b) => {
        const numA = parseInt(a.substring(1)); // Extract number after "R"
        const numB = parseInt(b.substring(1));
        return numA - numB; // Numeric comparison
      }));
      
    setRaceNumber('');
    setTimestamp('');
  }, [date]);

  // Load timestamps when both date and race number are selected
  useEffect(() => {
    if (!date || !raceNumber) {
      setAvailableTimestamps([]);
      return;
    }

    const context = require.context('../data', false, /\.json$/);
    const files = context.keys();
    
    const timestamps = files
      .filter(filename => filename.includes(`${date}-${raceNumber}-odds_`))
      .map(filename => {
        return filename.split('-odds_')[1].replace('.json', '');
      });
    
    setAvailableTimestamps([...new Set(timestamps)].sort());
    setTimestamp('');
  }, [date, raceNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && raceNumber && timestamp) {
      onAnalyze({ 
        date, 
        raceNumber,
        timestamp
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compact-race-selector">
      <div className="form-row">
        <div className="form-group compact">
          <label htmlFor="race-date">Race Date</label>
          <select 
            id="race-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          >
            <option value="">Select Date</option>
            {availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group compact">
          <label htmlFor="race-number">Race Number</label>
          <select
            id="race-number"
            value={raceNumber}
            onChange={(e) => setRaceNumber(e.target.value)}
            disabled={!date}
            required
          >
            <option value="">Select Race</option>
            {availableRaceNumbers.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="form-group compact">
          <label htmlFor="race-time">Extracted Time</label>
          <select
            id="race-time"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            disabled={!raceNumber}
            required
          >
            <option value="">Select Time</option>
            {availableTimestamps.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="compact-analyze-button"
        disabled={!timestamp}
      >
        Analyze
      </button>
    </form>
  );
};

export default RaceSelector;