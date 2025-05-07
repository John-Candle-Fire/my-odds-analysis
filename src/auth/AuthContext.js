// src/auth/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import AUTH_DATA from './authData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hkjc-odds-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('hkjc-odds-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const userData = AUTH_DATA[username];
    if (!userData) return false;

    const isMatch = await bcrypt.compare(password, userData.hash);
    if (isMatch) {
      const userObj = { 
        username, 
        role: userData.role,
        loginTime: new Date().toISOString() 
      };
      setUser(userObj);
      localStorage.setItem('hkjc-odds-user', JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hkjc-odds-user');
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    const roles = { user: 1, admin: 2 };
    return roles[user.role] >= roles[requiredRole];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}