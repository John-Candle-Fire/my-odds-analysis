import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>© {new Date().getFullYear()} HKJC Odds Analyzer</p>
        <p className="disclaimer">
          Disclaimer: This site is for informational purposes only. 
          The information provided should not be considered as betting advice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;