// src/components/layout.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Footer from './footer';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            {user && <Link to="/analyze">Race Analysis</Link>}
            <Link to="/about">About</Link>
            {user ? (
              <button onClick={logout} className="nav-button">
                Logout ({user.username})
              </button>
            ) : (
              <Link to="/login" className="login-link">Login</Link>
            )}
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