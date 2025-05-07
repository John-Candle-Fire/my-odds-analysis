// src/pages/aboutPage.jsx
import React from 'react';
import '../styles/main.css'; // Uses your existing styles

/**
 * About page component
 * @returns {JSX.Element} About page content
 */
const aboutPage = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      {/* Title */}
      <h2 style={{ 
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: '600'
      }}>
        Hong Kong Jockey Club Odds Analyzer
      </h2>

      {/* Description */}
      <p style={{ 
        textAlign: 'justify',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
      }}>
        This analytical tool provides advanced statistical analysis of Hong Kong horse racing odds,
        helping users identify value bets and market trends. The application processes non-real-time
        odds data (at extracted time) to generate actionable insights.
      </p>

      {/* Version Info */}
      <div style={{ marginBottom: '2rem' }}>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Data Source:</strong> HKJC Official Website</p>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      {/* HKJC Disclaimer */}
      <div className="disclaimer-box" style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #6c757d'
      }}>
        <h3 style={{ 
          marginTop: '0',
          color: '#2c3e50'
        }}>
          Important Notice
        </h3>
        <p style={{ 
          marginBottom: '0',
          fontStyle: 'italic'
        }}>
          This website is intended for learning and analytical purposes only. The Hong Kong Jockey Club does not endorse this 
          application. Any bets are placed at your own risk. The information provided should not be 
          considered as betting advice. Always verify odds with official sources before taking any action.
        </p>
      </div>

      {/* Development Info */}
      <p style={{ 
        color: '#6c757d',
        fontSize: '0.9rem',
        marginTop: '2rem'
      }}>
        This function is created as a learning exercise.
      </p>
    </div>
  );
};

export default aboutPage;