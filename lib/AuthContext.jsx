'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('noor_admin_auth');
      if (auth === 'true') {
        setIsAdmin(true);
      }
      setIsLoaded(true);
    }
  }, []);

  const login = (password) => {
    if (password === 'Noor@.5923') {
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('noor_admin_auth', 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noor_admin_auth');
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
