// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.css';
import RaceAnalysis from './pages/raceAnalysis';
import HomePage from './pages/homePage';
import Layout from './components/layout';
import LoginPage from './pages/loginPage';
import AboutPage from './pages/aboutPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/analyze" 
              element={
                <ProtectedRoute>
                  <RaceAnalysis />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;