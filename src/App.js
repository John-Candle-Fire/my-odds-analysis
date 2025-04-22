import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/main.css';
import RaceAnalysis from './pages/raceAnalysis';
import HomePage from './pages/homePage';
import Layout from './components/layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<RaceAnalysis />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;