import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './footer';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">HKJC Odds Analyzer</Link>
          <div 
            className={`nav-links ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <Link to="/">Home</Link>
            <Link to="/analyze">Race Analysis</Link>
            <Link to="/about">About</Link>
          </div>
          <div 
            className="hamburger" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Layout;