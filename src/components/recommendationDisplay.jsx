// src/components/recommendationDisplay.jsx

import React from 'react';
import '../styles/main.css';

/**
 * Displays bet recommendations with formatted messages
 * Follows the same styling pattern as findingsDisplay
 * @param {Object} betRecommendData - Bet recommendation data from dataLoader
 * @param {Array} horseInfo - Array of horse details for name lookup
 */
const RecommendationDisplay = ({ betRecommendData, horseInfo }) => {
  if (!betRecommendData) {
    return (
      <div className="findings-display">
        <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
          No recommendations available for this race
        </p>
      </div>
    );
  }

  // Create horse name lookup map with explicit string conversion
  const horseNameMap = {};
  if (horseInfo && Array.isArray(horseInfo)) {
    horseInfo.forEach(horse => {
      const horseNum = String(horse['Horse Number']).trim();  
      const horseName = horse['Horse Name'];
      if (horseNum && horseName) {  
        horseNameMap[horseNum] = horseName;
      }
    });
  }

  // Explicit conversion with trim for lookup
  const bankerNum = String(betRecommendData.BANKER).trim();
  const leg1Num = String(betRecommendData.LEG1).trim();
  const leg2Num = String(betRecommendData.LEG2).trim();
  const leg3Num = String(betRecommendData.LEG3).trim();

  // Get horse names
  const bankerName = horseNameMap[bankerNum] || '???';
  const leg1Name = horseNameMap[leg1Num] || '???';
  const leg2Name = horseNameMap[leg2Num] || '???';
  const leg3Name = horseNameMap[leg3Num] || '???';

  // Construct message
  const message = `QP ${betRecommendData.BANKER} ${bankerName} > ${betRecommendData.LEG1} ${leg1Name} + ${betRecommendData.LEG2} ${leg2Name} + ${betRecommendData.LEG3} ${leg3Name} (${betRecommendData.expected_success_rate})`;

  return (
    <div className="findings-display">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid var(--primary)'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>
          Bet Recommendations
        </h3>
      </div>

      {/* Main recommendation card */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        {/* Order badge and timestamp */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <span style={{
            backgroundColor: 'var(--secondary)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>
            #1
          </span>
          <span style={{
            color: '#999',
            fontSize: '0.85rem'
          }}>
            {betRecommendData.timestamp_source}
          </span>
        </div>

        {/* Main recommendation message */}
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          borderRadius: '4px',
          borderLeft: '4px solid var(--secondary)',
          marginBottom: '1rem'
        }}>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: '500',
            lineHeight: '1.6',
            margin: 0,
            wordBreak: 'break-word'
          }}>
            {message}
          </p>
        </div>

        {/* Metadata section */}
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <div>
              <strong>Strategy:</strong> {betRecommendData.strategy} ({betRecommendData.strategy_version})
            </div>
            <div>
              <strong>Active Legs:</strong> {betRecommendData.active_legs} of {betRecommendData.total_candidates_available} candidates
            </div>
            <div>
              <strong>Sources:</strong> BANKER from {betRecommendData.BANKER_source}, 
              LEG1 from {betRecommendData.LEG1_source}, 
              LEG2 from {betRecommendData.LEG2_source}, 
              LEG3 from {betRecommendData.LEG3_source}
            </div>
          </div>
        </div>
      </div>

      {/* Legend/Help section */}
      <div style={{
        background: '#f0f8ff',
        padding: '1rem',
        borderRadius: '4px',
        borderLeft: '4px solid var(--info)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--info)' }}>
          ℹ️ How to Read
        </p>
        <p style={{ margin: 0, lineHeight: '1.5', color: '#555' }}>
          <strong>QP</strong> = Quinella Place bet. 
          The <strong>BANKER</strong> horse covers the three <strong>LEG</strong> horses. 
          Expected success rate is shown in parentheses.
        </p>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
