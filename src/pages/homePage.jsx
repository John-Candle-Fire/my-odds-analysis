import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Hong Kong Jockey Club Odds Analyzer</h1>
      <p>Advanced analysis tools for HKJC racing data</p>
      
      <div className="disclaimer-box">
        <h3>Important Notice</h3>
        <p>
          This website is intended for learning and analytical purposes only. 
          The Hong Kong Jockey Club does not endorse this application.
          Any bets are placed at your own risk. The information provided should not be considered as betting advice. 
          Always verify odds with official sources before taking any action.
        </p>
      </div>

      <Link to="/analyze" className="btn btn-primary">
        Start Analyzing
      </Link>
    </div>
  );
};

export default HomePage;